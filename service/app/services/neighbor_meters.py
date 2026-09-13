from sqlalchemy.orm import Session, contains_eager, joinedload
from app.models import NeighborMeter, Neighbor, Measure, MeterReading, DebtItem
from app.models.measure import measure_rank, measure_rank_expr
import re
from datetime import datetime, time

from app.enums import MeterReadingStatus, MeterSection


def get_neighbor_meters(db: Session):
  """
  Get all OTB meters with
  """
  return db.query(NeighborMeter, Neighbor).join(NeighborMeter.neighbor).all()


def get_previous_reading_map(
  db: Session, readings: list[MeterReading]
) -> dict[int, int]:
  """
  Maps reading_id -> the value its meter was previously read at.

  Derived instead of stored: the answer is the last READED reading of that same
  meter before this one, falling back to the meter's initial_reading. Taking
  "the previous measure" instead would bill a meter that was skipped or
  disabled for a period against its initial_reading, which is its whole
  lifetime of consumption.

  Only READED readings count as a precedent: the rest of a measure is created
  empty, and a 0 sitting there is the absence of a reading, not a value.
  """
  if not readings:
    return {}

  meter_ids = {reading.meter_id for reading in readings}

  initial_by_meter = dict(
    db.query(NeighborMeter.id, NeighborMeter.initial_reading).filter(
      NeighborMeter.id.in_(meter_ids)
    ).all()
  )

  # Every reading those meters ever had, oldest first
  rank = measure_rank_expr()
  history = db.query(
    MeterReading.id, MeterReading.meter_id, MeterReading.current_reading, rank
  ).join(MeterReading.measure).filter(
    MeterReading.meter_id.in_(meter_ids),
    MeterReading.status == MeterReadingStatus.READED,
  ).order_by(MeterReading.meter_id, rank, MeterReading.id).all()

  # meter_id -> [(rank, reading_id, value)] in chronological order
  by_meter: dict[int, list[tuple[int, int, int]]] = {}
  for reading_id, meter_id, value, reading_rank in history:
    by_meter.setdefault(meter_id, []).append(
      (reading_rank, reading_id, value or 0)
    )

  ranks_by_reading = {
    reading_id: reading_rank for reading_id, _, _, reading_rank in history
  }

  previous: dict[int, int] = {}
  for reading in readings:
    fallback = initial_by_meter.get(reading.meter_id) or 0
    own_rank = ranks_by_reading.get(reading.id)
    if own_rank is None:
      # Not read yet: its precedent is simply the meter's latest reading
      own_rank = measure_rank(reading.measure)

    value = fallback
    for reading_rank, reading_id, reading_value in by_meter.get(
      reading.meter_id, []
    ):
      # Strictly before, and never the reading itself
      if reading_rank < own_rank and reading_id != reading.id:
        value = reading_value
      else:
        break
    previous[reading.id] = value

  return previous


def get_previous_reading(db: Session, reading: MeterReading) -> int:
  """The previous value of a single reading. See get_previous_reading_map"""
  return get_previous_reading_map(db, [reading]).get(reading.id, 0)


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

  meter_readings = [
    MeterReading(
      meter_id = meter.id,
      measure_id = measure.id,
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
    joinedload(MeterReading.debt_item).joinedload(DebtItem.payment),
  ).order_by(measure_rank_expr(), Measure.id).all()

  readings_by_meter: dict[int, list[MeterReading]] = {meter.id: [] for meter in meters}
  for reading in readings:
    readings_by_meter[reading.meter_id].append(reading)

  previous_by_reading = get_previous_reading_map(db, readings)

  ledgers = []
  for meter in meters:
    history = []
    debts = []
    payments = []

    for reading in readings_by_meter[meter.id]:
      measure = reading.measure
      period = measure.period or ""
      year = measure.year
      previous_reading = previous_by_reading.get(reading.id, 0)

      # An unread meter has no consumption yet: charting it as 0 would draw a
      # dip that never happened
      if reading.status == MeterReadingStatus.READED:
        history.append({
          "period": period,
          "year": year,
          "consumption": max(0, reading.current_reading - previous_reading),
        })

      debt = reading.debt_item
      # A debt is only real once the reading was taken and billed. The ones
      # with no amount belong to meters nobody read: they stay on the register
      # to be annulled, but there is nothing to show the neighbor
      if debt is not None and debt.amount > 0:
        debts.append({
          "id": debt.id,
          "period": period,
          "year": year,
          "previous_reading": previous_reading,
          "current_reading": reading.current_reading,
          "consumption": debt.consumption or 0,
          "amount": debt.amount,
          "status": debt.status,
        })

        # One payment per debt, so a settled debt carries its own receipt
        payment = debt.payment
        if payment is not None:
          payments.append({
            "id": payment.id,
            "receipt": f"{payment.id:06d}",
            "date": payment.paid_at.isoformat() if payment.paid_at else None,
            "period": period,
            "amount": payment.amount,
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
      "payments": list(reversed(payments)),
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


def get_meter_by_id(db: Session, meter_id: int):
  return db.query(NeighborMeter).filter(NeighborMeter.id == meter_id).first()


def set_meter_active(db: Session, meter: NeighborMeter, is_active: bool) -> NeighborMeter:
  """
  Enables or disables a meter. A disabled meter stays on the register with all
  its history: it is simply left out of the next measures.
  """
  meter.is_active = is_active
  db.commit()
  db.refresh(meter)
  return meter


def annotate_previous_readings(db: Session, readings: list[MeterReading]):
  """
  Sets `previous_reading` on each reading so the schemas can read it like any
  other attribute. It is a plain Python attribute, not a column: nothing of it
  is written back to the database.
  """
  previous = get_previous_reading_map(db, readings)
  for reading in readings:
    reading.previous_reading = previous.get(reading.id, 0)
  return readings
