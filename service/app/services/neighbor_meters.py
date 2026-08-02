from sqlalchemy.orm import Session, contains_eager, joinedload
from app.models import NeighborMeter, Neighbor, Measure, MeterReading
from app.enums import MeterReadingStatus


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
