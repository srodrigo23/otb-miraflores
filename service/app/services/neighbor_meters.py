from sqlalchemy.orm import Session
from app.models import NeighborMeter, Neighbor, Measure, MeterReading


def get_neighbor_meters(db: Session):
  """
  Get all OTB meters with 
  """
  return db.query(NeighborMeter, Neighbor).join(NeighborMeter.neighbor).all()

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
  
  
