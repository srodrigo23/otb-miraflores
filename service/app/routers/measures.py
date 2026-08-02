# ========== MEDICIONES ==========
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app import models
from app.schemas import schema as schemas
from app.db.database import get_db

import app.services.measures as measures_service
import app.services.neighbor_meters as neighbor_meters
import app.services.debts as debts_service
from app.enums import MeasureType, DebtStatus

router = APIRouter(
  prefix="/measures", 
  tags=['Measures'], 
  responses={404: {"description": "Not found"}}
)

@router.get("")
def read_measures(db: Session = Depends(get_db)):
  """
  Get all meassures sorted by creation date
  """
  measures = measures_service.get_measures(db=db)
  return measures


@router.get("/{measure_id}", response_model=schemas.Measure)
def read_measure(measure_id: int, db: Session = Depends(get_db)):
  """
  Get a specific measure
  """
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if measure is None:
    raise HTTPException(status_code=404, detail="Measure not found")
  return measure

@router.post("", response_model=schemas.Measure)
def create_measure(measure: schemas.MeasureCreate, db: Session = Depends(get_db)):
  """
  Creates a new measure
  """
  db_measure = measures_service.create_measure(db=db, measure=measure)
  return db_measure

@router.put("/{measure_id}", response_model=schemas.Measure)
def update_measure(measure_id: int, measure: schemas.MeasureUpdate, db: Session = Depends(get_db)):
  """
  Updates a measure
  """
  db_measure = measures_service.update_measure(db, measure_id=measure_id, measure=measure)
  if db_measure is None:
    raise HTTPException(status_code=404, detail="Measure not found")

  return db_measure


@router.delete("/{measure_id}")
def delete_measure(measure_id: int, db: Session = Depends(get_db)):
  """
  Elimina una medición
  """
  success = measures_service.delete_measure(db, measure_id=measure_id)
  if not success:
    raise HTTPException(status_code=404, detail="Measure not found")
  return {"message": "Measure deleted successfully", "id": measure_id}

@router.post("/{measure_id}/close", response_model=schemas.Measure)
def close_measure(measure_id: int, db: Session = Depends(get_db)):
  """
  Closes the readings of a measure (IN_PROGRESS -> CLOSED)
  """
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")

  # Already closed: idempotent, so a repeated click does not fail
  if measure.status == MeasureType.CLOSED:
    return measure

  if measure.status != MeasureType.IN_PROGRESS:
    raise HTTPException(
      status_code=400,
      detail="Only a measure in progress can be closed"
    )

  return measures_service.close_measure(db=db, measure_id=measure_id)


@router.post("/{measure_id}/generate-empty-meter-readings", response_model=list[schemas.MeterReadingDetail])
def generate_debts_from_measure(measure_id: int, db: Session = Depends(get_db)):
  """
  Generate meter readings to be edited and generate debts
  """
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")
  
  # Already generated: return the existing readings instead of an empty list,
  # which left the client table with no data
  if measure.status != MeasureType.CREATED:
    return measures_service.get_meter_readings_by_measure(db=db, measure_id=measure_id)

  # update state of measure after this
  measure.status = MeasureType.IN_PROGRESS
  measure_pydantic_casted = schemas.MeasureUpdate.model_validate(measure)
  measures_service.update_measure(
    db=db,
    measure_id=measure_id,
    measure=measure_pydantic_casted
  )

  meters_with_neighbor = neighbor_meters.get_neighbor_meters(db=db) # Get all meters and then create every meter reading with measure ID
  created_readings = neighbor_meters.create_meter_readings_by_measure(
    db=db,
    measure=measure,
    meters=meters_with_neighbor
  )

  # One pending debt per reading, still with no amount: it is settled when the
  # reading is recorded
  debts_service.create_debts_for_readings(db=db, readings=created_readings)

  # Re-read: the newly created objects are expired after the commit, and their
  # meter/neighbor relationships are what the response schema reads from
  return measures_service.get_meter_readings_by_measure(db=db, measure_id=measure_id)


@router.get("/{measure_id}/meter-readings", response_model=list[schemas.MeterReadingDetail])
def get_measure_meter_readings(measure_id: int, db: Session = Depends(get_db)):
  """
  Obtiene todas las lecturas de medidores para una medición específica
  """
  # Verificar que la medición existe
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")

  # Obtener todas las lecturas de esta medición con información del vecino y medidor
  return measures_service.get_meter_readings_by_measure(db=db, measure_id=measure_id)



@router.put(
  "/{measure_id}/meter-readings/{reading_id}",
  response_model=schemas.MeterReadingDetail
)
def update_measure_meter_reading(
  measure_id: int,
  reading_id: int,
  reading_update: schemas.MeterReadingUpdate,
  db: Session = Depends(get_db)
):
  """
  Updates the editable fields of a reading (current value and notes)
  """
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")

  # A closed measure takes no more readings: that is what closing it means
  if measure.status == MeasureType.CLOSED:
    raise HTTPException(
      status_code=400,
      detail="A closed measure does not accept readings"
    )

  reading = measures_service.get_meter_reading(
    db, measure_id=measure_id, reading_id=reading_id
  )
  if not reading:
    raise HTTPException(status_code=404, detail="Meter reading not found")

  updated = measures_service.update_meter_reading(
    db=db, reading=reading, data=reading_update
  )

  # Recorded reading means the consumption and the amount can be settled
  debts_service.sync_debt_for_reading(db=db, reading=updated)

  return updated


@router.get("/{measure_id}/debts", response_model=list[schemas.DebtItemDetail])
def get_measure_debts(measure_id: int, db: Session = Depends(get_db)):
  """
  Obtiene las deudas generadas por una medición
  """
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")

  return debts_service.get_debts_by_measure(db=db, measure_id=measure_id)


@router.delete("/{measure_id}/debts")
def delete_measure_debts(measure_id: int, db: Session = Depends(get_db)):
  """
  Elimina todas las deudas generadas para una medición específica
  Solo elimina deudas que no hayan sido pagadas (status = pending)
  """
  # Verificar que la medición existe
  measure = measures_service.get_measure(db, measure_id=measure_id)
  if not measure:
    raise HTTPException(status_code=404, detail="Measure not found")

  # Obtener todas las lecturas de esta medición
  meter_readings = db.query(models.MeterReading).filter(
    models.MeterReading.measure_id == measure_id
  ).all()

  reading_ids = [reading.id for reading in meter_readings]

  # Eliminar solo las deudas pendientes (no pagadas) asociadas a estas lecturas
  debts_deleted = db.query(models.DebtItem).filter(
    models.DebtItem.meter_reading_id.in_(reading_ids),
    models.DebtItem.status == DebtStatus.PENDING
  ).delete(synchronize_session=False)

  db.commit()

  return {
    "message": f"Debts deleted successfully",
    "debts_deleted": debts_deleted
  }
