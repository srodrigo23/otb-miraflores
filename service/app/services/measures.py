from sqlalchemy.orm import Session
from app.models.measure import Measure
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
    is_first_measure=measure.is_first_measure,
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
    if "measure_date" in update_data and update_data["measure_date"]:
      from datetime import datetime
      update_data["measure_date"] = datetime.strptime(update_data["measure_date"], "%Y-%m-%d").date()

    for key, value in update_data.items():
      setattr(db_measure, key, value)
    db.commit()
    db.refresh(db_measure)
  return db_measure


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

