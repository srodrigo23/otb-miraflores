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
  meters: list[(NeighborMeter, Neighbor)]) -> list[MeterReading]:
  """
  With a measure and a list of measures, this creates empty meter readings
  """
  if len(meters)== 0: return []
  meter_readings = []
  for meter, neighbor in meters:
    new_meter_readind = MeterReading(
      meter_id = meter.id,
      measure_id = measure.id,
      # current_measure = 0,
      # status = 
    )
    db.add(new_meter_readind)
    db.commit()
    db.refresh(new_meter_readind)
    meter_readings.append(new_meter_readind)
  return meter_readings
  
  
