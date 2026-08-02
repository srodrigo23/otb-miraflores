from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

from ..schemas import schema as schemas
from ..services import crud
import app.services.debts as debts_service
from ..db.database import get_db

router = APIRouter(
  prefix="/neighbors", 
  tags=['Neighbors'], 
  responses={404: {"description": "Not found"}}
)

@router.post("", response_model=schemas.Neighbor, )
def create_neighbor(neighbor: schemas.NeighborCreate, db: Session = Depends(get_db)):
  # Validar email solo si se proporciona
  if neighbor.email:
    db_neighbor = crud.get_neighbor_by_email(db, email=neighbor.email)
    if db_neighbor:
      raise HTTPException(status_code=400, detail="Email already registered")
  return crud.create_neighbor(db=db, neighbor=neighbor)

@router.get("", response_model=list[schemas.Neighbor])
def read_neighbors( db: Session = Depends(get_db)):
  neighbors = crud.get_neighbors(db=db)
  return neighbors if len(neighbors)>0 else []
  # if len(neig):
  #   return {
  #     "data": neighbors,
  #     # "total": len(neighbors),
  #     # "page": skip // limit + 1 if limit > 0 else 1,
  #     # "size": limit
  #   }
  # return {'Error': 'No Neighbors'}

@router.get("/{neighbor_id}", response_model=schemas.NeighborDetail)
def read_neighbor_detail(neighbor_id:int, db:Session= Depends(get_db)):
  neighbor_answer = crud.get_neighbor_by_id(db, neighbor_id=neighbor_id)
  if not neighbor_answer:
    raise HTTPException(status_code=404, detail="Neighbor not found")
  neighbor = neighbor_answer[0][0]
  meters = []
  for _, meter in neighbor_answer:
    meters.append(meter)
  return {
    "id":neighbor.id,
    "first_name":neighbor.first_name,
    "second_name":neighbor.second_name,
    "last_name":neighbor.last_name,
    "email":neighbor.email,
    "ci":neighbor.ci,
    "phone_number": neighbor.phone_number,
    "birth_day":neighbor.birth_day,
    "is_active":neighbor.is_active,
    "meters":meters
  } 
  

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
  db_user = crud.get_user(db, user_id=user_id)
  if db_user is None:
    raise HTTPException(status_code=404, detail="User not found")
  return db_user


@router.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(
    user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)
):
    return crud.create_user_item(db=db, item=item, user_id=user_id)


@router.get("/items/", response_model=list[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items


@router.put("/{neighbor_id}", response_model=schemas.Neighbor)
def update_neighbor(neighbor_id: int, neighbor: schemas.NeighborUpdate, db: Session = Depends(get_db)):
  db_neighbor = crud.update_neighbor(db, neighbor_id=neighbor_id, neighbor=neighbor)
  if db_neighbor is None:
    raise HTTPException(status_code=404, detail="Neighbor not found")
  return db_neighbor


@router.delete("/{neighbor_id}")
def delete_neighbor(neighbor_id: int, db: Session = Depends(get_db)):
  success = crud.delete_neighbor(db, neighbor_id=neighbor_id)
  if not success:
    raise HTTPException(status_code=404, detail="Neighbor not found")
  return {"message": "Neighbor deleted successfully", "id": neighbor_id}


@router.get("/{neighbor_id}/meters")
def get_neighbor_meters(neighbor_id: int, db: Session = Depends(get_db)):
  """
  Obtiene todos los medidores de un vecino
  """
  # Verificar que el vecino existe
  neighbor = crud.get_neighbor(db, neighbor_id=neighbor_id)
  if neighbor is None:
    raise HTTPException(status_code=404, detail="Neighbor not found")

  # Obtener medidores
  meters = crud.get_neighbor_meters(db, neighbor_id=neighbor_id)

  # Formatear respuesta
  meters_data = []
  for meter in meters:
    meters_data.append({
      "id": meter.id,
      "meter_code": meter.meter_code,
      "label": meter.label,
      "is_active": meter.is_active,
      "installation_date": str(meter.installation_date) if meter.installation_date else None,
      "last_maintenance_date": str(meter.last_maintenance_date) if meter.last_maintenance_date else None,
      "notes": meter.notes,
      "created_at": str(meter.created_at)
    })

  return meters_data


@router.get("/{neighbor_id}/payments")
def get_neighbor_payments(neighbor_id: int, db: Session = Depends(get_db)):
  """
  Obtiene todos los pagos realizados por un vecino con sus detalles
  """
  # Verificar que el vecino existe
  neighbor = crud.get_neighbor(db, neighbor_id=neighbor_id)
  if neighbor is None:
    raise HTTPException(status_code=404, detail="Neighbor not found")

  # Obtener pagos
  payments = crud.get_neighbor_payments(db, neighbor_id=neighbor_id)

  # Formatear respuesta con detalles de cada pago
  payments_data = []
  for payment in payments:
    # Obtener detalles del pago (a qué deudas se aplicó)
    payment_details_list = []
    for detail in payment.payment_details:
      debt_item = detail.debt_item
      payment_details_list.append({
        "id": detail.id,
        "debt_item_id": detail.debt_item_id,
        "debt_reason": debt_item.reason if debt_item else "Desconocido",
        "debt_type_name": debt_item.debt_type.name if debt_item and debt_item.debt_type else "Desconocido",
        "amount_applied": detail.amount_applied,
        "previous_balance": detail.previous_balance,
        "new_balance": detail.new_balance,
        "notes": detail.notes
      })

    payments_data.append({
      "id": payment.id,
      "neighbor_id": payment.neighbor_id,
      "collect_debt_id": payment.collect_debt_id,
      "payment_date": str(payment.payment_date),
      "total_amount": payment.total_amount,
      "payment_method": payment.payment_method,
      "reference_number": payment.reference_number,
      "received_by": payment.received_by,
      "notes": payment.notes,
      "created_at": str(payment.created_at),
      "payment_details": payment_details_list
    })

  return payments_data


# ========== RUTAS DE DEUDAS ==========

def _neighbor_debts_response(neighbor, debts) -> dict:
  """
  Shared payload for both debt listings
  """
  neighbor_name = f"{neighbor.first_name} {neighbor.second_name or ''} {neighbor.last_name}".strip()
  return {
    "neighbor_id": neighbor.id,
    "neighbor_name": neighbor_name,
    "total_debts": len(debts),
    "total_amount": sum(debt.amount for debt in debts),
    "total_paid": sum(debt.amount_paid for debt in debts),
    "debt_details": debts,
  }


@router.get("/{neighbor_id}/debts/active", response_model=schemas.NeighborDebtsResponse)
def get_neighbor_active_debts(neighbor_id: int, db: Session = Depends(get_db)):
  """
  Obtiene las deudas pendientes de un vecino
  """
  neighbor = crud.get_neighbor(db, neighbor_id=neighbor_id)
  if neighbor is None:
    raise HTTPException(status_code=404, detail="Neighbor not found")

  debts = debts_service.get_neighbor_debts(db, neighbor_id=neighbor_id, only_pending=True)
  return _neighbor_debts_response(neighbor, debts)


@router.get("/{neighbor_id}/debts/all", response_model=schemas.NeighborDebtsResponse)
def get_neighbor_all_debts(neighbor_id: int, db: Session = Depends(get_db)):
  """
  Obtiene todas las deudas de un vecino, incluyendo las pagadas
  """
  neighbor = crud.get_neighbor(db, neighbor_id=neighbor_id)
  if neighbor is None:
    raise HTTPException(status_code=404, detail="Neighbor not found")

  debts = debts_service.get_neighbor_debts(db, neighbor_id=neighbor_id, only_pending=False)
  return _neighbor_debts_response(neighbor, debts)
