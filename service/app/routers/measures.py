# ========== MEDICIONES ==========
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app import models
from app.schemas import schema as schemas
from app.services import crud
from app.db.database import get_db

import app.services.measures as measures_service
import app.services.neighbor_meters as neighbor_meters
from app.enums import MeasureType

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
  db_measure = crud.update_measure(db, measure_id=measure_id, measure=measure)
  if db_measure is None:
    raise HTTPException(status_code=404, detail="Measure not found")

  return {
    "id": db_measure.id,
    "measure_date": str(db_measure.measure_date),
    "period": db_measure.period,
    "reader_name": db_measure.reader_name,
    "status": db_measure.status,
    "total_meters": db_measure.total_meters,
    "meters_read": db_measure.meters_read,
    "meters_pending": db_measure.meters_pending,
    "notes": db_measure.notes,
    "created_at": str(db_measure.created_at),
    "updated_at": str(db_measure.updated_at)
  }


@router.delete("/{measure_id}")
def delete_measure(measure_id: int, db: Session = Depends(get_db)):
  """
  Elimina una medición
  """
  success = measures_service.delete_measure(db, measure_id=measure_id)
  if not success:
    raise HTTPException(status_code=404, detail="Measure not found")
  return {"message": "Measure deleted successfully", "id": measure_id}

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
  neighbor_meters.create_meter_readings_by_measure(
    db=db,
    measure=measure,
    meters=meters_with_neighbor
  )

  # Re-read: the newly created objects are expired after the commit, and their
  # meter/neighbor relationships are what the response schema reads from
  return measures_service.get_meter_readings_by_measure(db=db, measure_id=measure_id)

  # # Obtener o crear el tipo de deuda "Consumo de Agua"
  # debt_type = db.query(models.DebtType).filter(models.DebtType.name == "Consumo de Agua").first()
  # if not debt_type:
  #   debt_type = models.DebtType(
  #     name="Consumo de Agua",
  #     description="Deuda por consumo de agua mensual"
  #   )
  #   db.add(debt_type)
  #   db.commit()
  #   db.refresh(debt_type)

  # # Obtener todas las lecturas de esta medición
  # meter_readings = db.query(models.MeterReading).filter(
  #   models.MeterReading.measure_id == measure_id
  # ).join(
  #   models.NeighborMeter, models.MeterReading.meter_id == models.NeighborMeter.id
  # ).all()

  # debts_created = 0
  # debts_skipped = 0
  # debts_details = []

  # for reading in meter_readings:
  #   # Verificar si ya existe una deuda para esta lectura
  #   existing_debt = db.query(models.DebtItem).filter(
  #     models.DebtItem.meter_reading_id == reading.id
  #   ).first()

  #   if existing_debt:
  #     debts_skipped += 1
  #     continue

  #   # Obtener la lectura anterior del mismo medidor
  #   previous_reading = db.query(models.MeterReading).filter(
  #     models.MeterReading.meter_id == reading.meter_id,
  #     models.MeterReading.id < reading.id
  #   ).order_by(models.MeterReading.id.desc()).first()

  #   # Calcular consumo
  #   if previous_reading:
  #     consumption = reading.current_reading - previous_reading.current_reading
  #   else:
  #     # Si no hay lectura anterior, usar la lectura actual como consumo
  #     consumption = reading.current_reading

  #   # Calcular monto según la lógica (en bolivianos)
  #   if consumption <= 20:
  #     amount = 20  # Bs. 20
  #   else:
  #     amount = consumption  # Bs. 1 por m3

  #   # Crear la deuda
  #   from datetime import date
  #   debt_item = models.DebtItem(
  #     neighbor_id=reading.meter.neighbor_id,
  #     debt_type_id=debt_type.id,
  #     meter_reading_id=reading.id,
  #     amount=amount,
  #     amount_paid=0,
  #     balance=amount,
  #     reason=f"Consumo de agua - {consumption} m3",
  #     period=measure.period,
  #     issue_date=date.today(),
  #     status="pending"
  #   )
  #   db.add(debt_item)
  #   debts_created += 1

  #   debts_details.append({
  #     "neighbor_id": reading.meter.neighbor_id,
  #     "neighbor_name": f"{reading.meter.neighbor.first_name} {reading.meter.neighbor.last_name}",
  #     "consumption": consumption,
  #     "amount": amount,
  #     "meter_reading_id": reading.id
  #   })

  # db.commit()

  # return {
  #   "message": f"Debts generated successfully",
  #   "debts_created": debts_created,
  #   "debts_skipped": debts_skipped,
  #   "total_readings": len(meter_readings),
  #   "details": debts_details
  # }


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



@router.delete("/{measure_id}/debts")
def delete_measure_debts(measure_id: int, db: Session = Depends(get_db)):
  """
  Elimina todas las deudas generadas para una medición específica
  Solo elimina deudas que no hayan sido pagadas (status = pending)
  """
  # Verificar que la medición existe
  measure = crud.get_measure(db, measure_id=measure_id)
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
    models.DebtItem.status == "pending"
  ).delete(synchronize_session=False)

  db.commit()

  return {
    "message": f"Debts deleted successfully",
    "debts_deleted": debts_deleted
  }
