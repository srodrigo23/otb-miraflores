from sqlalchemy.orm import Session, contains_eager, joinedload
from app.models import NeighborMeter, Neighbor, Measure, MeterReading
import re
from datetime import datetime, time

from app.enums import MeterReadingStatus, MeterSection


def get_neighbor_meters(db: Session):
  """
  Get all OTB meters with
  """
  return db.query(NeighborMeter, Neighbor).join(NeighborMeter.neighbor).all()


def get_previous_readings_by_meter(db: Session, measure: Measure) -> dict[int, int]:
  """
  Maps meter_id -> value that meter was read at in the previous measure.
  Meters missing from the map have no previous measure and fall back to their
  own initial_reading.
  """
  previous_measure = db.query(Measure).filter(
    Measure.measure_date < measure.measure_date
  ).order_by(Measure.measure_date.desc(), Measure.id.desc()).first()

  if previous_measure is None:
    return {}

  rows = db.query(MeterReading.meter_id, MeterReading.current_reading).filter(
    MeterReading.measure_id == previous_measure.id
  ).all()
  return {meter_id: current_reading for meter_id, current_reading in rows}


def create_meter_readings_by_measure(
  db: Session,
  measure: Measure,
  meters: list[tuple[NeighborMeter, Neighbor]]) -> list[MeterReading]:
  """
  With a measure and a list of meters, this creates empty meter readings.
  A single commit for the whole batch: committing inside the loop expired every
  instance already appended, which left them without loaded attributes.
  """
  if len(meters)== 0: return []

  # Frozen now so the consumption of this measure does not shift if an older
  # measure is edited afterwards
  previous_readings = get_previous_readings_by_meter(db=db, measure=measure)

  meter_readings = [
    MeterReading(
      meter_id = meter.id,
      measure_id = measure.id,
      previous_reading = previous_readings.get(meter.id, meter.initial_reading or 0),
      # current_measure = 0,
      # status =
    )
    for meter, _ in meters
  ]
  db.add_all(meter_readings)
  db.commit()
  return meter_readings


def get_neighbor_meter_ledgers(db: Session, neighbor_id: int) -> list[dict]:
  """
  Every meter of a neighbor with its consumption history and its debts.

  Two queries regardless of how many meters or periods the neighbor has: one for
  the meters, one for the readings with their measure and debt already joined.
  """
  meters = db.query(NeighborMeter).filter(
    NeighborMeter.neighbor_id == neighbor_id
  ).order_by(NeighborMeter.meter_code).all()

  if len(meters) == 0:
    return []

  readings = db.query(MeterReading).filter(
    MeterReading.meter_id.in_([meter.id for meter in meters])
  ).join(
    MeterReading.measure
  ).options(
    contains_eager(MeterReading.measure),
    joinedload(MeterReading.debt_item),
  ).order_by(Measure.measure_date, Measure.id).all()

  readings_by_meter: dict[int, list[MeterReading]] = {meter.id: [] for meter in meters}
  for reading in readings:
    readings_by_meter[reading.meter_id].append(reading)

  ledgers = []
  for meter in meters:
    history = []
    debts = []

    for reading in readings_by_meter[meter.id]:
      measure = reading.measure
      period = measure.period or ""
      year = measure.measure_date.year

      # An unread meter has no consumption yet: charting it as 0 would draw a
      # dip that never happened
      if reading.status == MeterReadingStatus.READED:
        history.append({
          "period": period,
          "year": year,
          "consumption": max(0, reading.current_reading - reading.previous_reading),
        })

      debt = reading.debt_item
      # A debt is only real once the reading was taken and billed
      if debt is not None and debt.amount > 0:
        debts.append({
          "id": debt.id,
          "period": period,
          "year": year,
          "previous_reading": reading.previous_reading,
          "current_reading": reading.current_reading,
          "consumption": debt.consumption or 0,
          "amount": debt.amount,
          "status": debt.status,
        })

    ledgers.append({
      "id": meter.id,
      "meter_code": meter.meter_code,
      "section": meter.section,
      "initial_reading": meter.initial_reading,
      "is_active": meter.is_active,
      "history": history,
      # Newest first: what is owed now goes on top of the list
      "debts": list(reversed(debts)),
      # No Payment model yet, so nothing can fill this
      "payments": [],
    })

  return ledgers


# --- Meter codes -------------------------------------------------------------
# A meter code is "S-NNN": the section letter, a dash, and a zero-padded
# correlative that runs independently inside each section.
METER_CODE_PATTERN = re.compile(r"^([A-Z])-(\d+)$")
METER_CODE_DIGITS = 3


def build_meter_code(section: str, number: int) -> str:
  """"A", 7 -> "A-007" """
  return f"{section.upper()}-{number:0{METER_CODE_DIGITS}d}"


def get_next_meter_codes(db: Session) -> dict[str, str]:
  """
  The next free code of every section, as {"A": "A-019", "B": "B-011", ...}.

  One query answers the whole form: the client picks the code for the section
  the user selects instead of asking the API again on every change.

  The correlative is the highest one in use plus one, not the number of meters
  in the section: deleting a meter would otherwise suggest a code that is
  already taken, and meter_code is unique in the database.
  """
  highest: dict[str, int] = {}

  for (code,) in db.query(NeighborMeter.meter_code).all():
    match = METER_CODE_PATTERN.match((code or "").strip().upper())
    if not match:
      # Codes that predate the format are ignored rather than blocking the count
      continue
    section, number = match.group(1), int(match.group(2))
    highest[section] = max(highest.get(section, 0), number)

  # Every known section is answered, including the ones with no meters yet
  return {
    section.value: build_meter_code(section.value, highest.get(section.value, 0) + 1)
    for section in MeterSection
  }


def get_meter_by_code(db: Session, meter_code: str):
  return db.query(NeighborMeter).filter(
    NeighborMeter.meter_code == meter_code
  ).first()


def create_neighbor_meter(db: Session, neighbor_id: int, meter) -> NeighborMeter:
  """
  Registers a meter for an existing neighbor. The caller is expected to have
  checked the neighbor exists and the code is free.
  """
  db_meter = NeighborMeter(
    neighbor_id=neighbor_id,
    meter_code=meter.meter_code.strip().upper(),
    section=meter.section.value,
    initial_reading=meter.initial_reading,
    is_active=meter.is_active,
  )
  if meter.created_at is not None:
    # The form lets the user date the registration, e.g. when loading a meter
    # that was installed days ago
    db_meter.created_at = datetime.combine(meter.created_at, time.min)

  db.add(db_meter)
  db.commit()
  db.refresh(db_meter)
  return db_meter
