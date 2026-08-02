from sqlalchemy.orm import Session
from app.models import NeighborMeter, Neighbor, Measure, MeterReading


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
