from sqlalchemy.orm import Session, contains_eager
from app.models.measure import Measure
from app.models.meter_reading import MeterReading
from app.models.neighbor_meter import NeighborMeter
from app.models.neighbor import Neighbor
from app.enums import MeasureType
from app.schemas.schema import MeasureCreate, MeasureUpdate

def get_measures(db: Session):
  return db.query(Measure).order_by(Measure.created_at.desc()).all()

def get_measure(db: Session, measure_id: int):
  """
  Obtiene una medición específica por ID
  """
  return db.query(Measure).filter(Measure.id == measure_id).first()

def create_measure(db: Session, measure: MeasureCreate):
  """
  Crea una nueva medición
  """
  from datetime import datetime
  db_measure = Measure(
    measure_date=datetime.strptime(measure.measure_date, "%Y-%m-%d").date(),
    period=measure.period,
    reader_name=measure.reader_name,
    notes=measure.notes,
    status=MeasureType.CREATED,
  )
  db.add(db_measure)
  db.commit()
  db.refresh(db_measure)
  return db_measure


def update_measure(db: Session, measure_id: int, measure: MeasureUpdate):
  """
  Actualiza una medición existente
  """
  db_measure = db.query(Measure).filter(Measure.id == measure_id).first()
  if db_measure:
    update_data = measure.model_dump(exclude_unset=True)

    # Si se actualiza la fecha, convertirla
    # if "measure_date" in update_data and update_data["measure_date"]:
    #   from datetime import datetime
    #   update_data["measure_date"] = datetime.strptime(update_data["measure_date"], "%Y-%m-%d").date()

    for key, value in update_data.items():
      setattr(db_measure, key, value)
    db.commit()
    db.refresh(db_measure)
  return db_measure

def create_empty_meter_reading()->None:
  pass


def close_measure(db: Session, measure_id: int):
  """
  Closes a measure, moving it to its final state (IN_PROGRESS -> CLOSED)
  """
  db_measure = get_measure(db, measure_id=measure_id)
  if db_measure is None:
    return None
  db_measure.status = MeasureType.CLOSED
  db.commit()
  db.refresh(db_measure)
  return db_measure


def get_meter_readings_by_measure(db: Session, measure_id: int) -> list[MeterReading]:
  """
  Gets the readings of a measure, ordered by neighbor.
  The joins walk the relationships (MeterReading.meter -> NeighborMeter.neighbor)
  and contains_eager reuses those joined rows to populate the relationships, so
  the MeterReadingDetail schema reads them without one extra query per reading.
  """
  # Previous version, joining on explicit column conditions instead of relationships:
  # return db.query(MeterReading).filter(
  #   MeterReading.measure_id == measure_id
  # ).join(
  #   NeighborMeter, MeterReading.meter_id == NeighborMeter.id
  # ).join(
  #   Neighbor, NeighborMeter.neighbor_id == Neighbor.id
  # ).order_by(Neighbor.last_name, Neighbor.first_name).all()
  return db.query(MeterReading).filter(
    MeterReading.measure_id == measure_id
  ).join(
    MeterReading.meter
  ).join(
    NeighborMeter.neighbor
  ).options(
    contains_eager(MeterReading.meter).contains_eager(NeighborMeter.neighbor)
  ).order_by(Neighbor.last_name, Neighbor.first_name).all()




def delete_measure(db: Session, measure_id: int):
  """
  Elimina una medición
  """
  db_measure = db.query(Measure).filter(Measure.id == measure_id).first()
  if db_measure:
    db.delete(db_measure)
    db.commit()
    return True
  return False

