from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import app.services.debts as debts_service
import app.services.neighbor_meters as neighbor_meters
from app.db.database import get_db
from app.dependencies import get_current_user, require_roles

# from app.models.user import User
from app.enums import UserType
from app.schemas import schema as schemas
from app.services import neighbor

router = APIRouter(
    prefix="/neighbors",
    tags=["Neighbors"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(get_current_user)],  # every route requires a session
)

@router.post(
    "",
    response_model=schemas.Neighbor,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def create_neighbor(
    neighbor: schemas.NeighborCreate,
    db: Session = Depends(get_db),
):
    # Both are optional, so each one is only checked when it was provided
    if neighbor.email and neighbor.get_neighbor_by_email(db, email=neighbor.email):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    if neighbor.ci and neighbor.get_neighbor_by_ci(db, ci=neighbor.ci):
        raise HTTPException(status_code=400, detail="La cédula ya está registrada")

    return neighbor.create_neighbor(db=db, neighbor=neighbor)


@router.get(
    "",
    response_model=list[schemas.Neighbor],
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def read_neighbors(db: Session = Depends(get_db)):
    neighbors = neighbor.get_neighbors(db=db)
    return neighbors if len(neighbors) > 0 else []
    # if len(neig):
    #   return {
    #     "data": neighbors,
    #     # "total": len(neighbors),
    #     # "page": skip // limit + 1 if limit > 0 else 1,
    #     # "size": limit
    #   }
    # return {'Error': 'No Neighbors'}


@router.get(
    "/{neighbor_id}",
    response_model=schemas.NeighborDetail,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def read_neighbor_detail(neighbor_id: int, db: Session = Depends(get_db)):
    neighbor = neighbor.get_neighbor_by_id(db, neighbor_id=neighbor_id)
    if not neighbor:
        raise HTTPException(status_code=404, detail="Neighbor not found")
    # NeighborDetail reads straight off the ORM object, meters included
    return neighbor


@router.put(
    "/{neighbor_id}",
    response_model=schemas.Neighbor,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def update_neighbor(
    neighbor_id: int, neighbor: schemas.NeighborUpdate, db: Session = Depends(get_db)
):
    db_neighbor = neighbor.update_neighbor(db, neighbor_id=neighbor_id, neighbor=neighbor)
    if db_neighbor is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")
    return db_neighbor


@router.delete("/{neighbor_id}", dependencies=[Depends(require_roles(UserType.ADMIN))])
def delete_neighbor(neighbor_id: int, db: Session = Depends(get_db)):
    success = neighbor.delete_neighbor(db, neighbor_id=neighbor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Neighbor not found")
    return {"message": "Neighbor deleted successfully", "id": neighbor_id}


@router.get(
    "/{neighbor_id}/meters",
    response_model=list[schemas.MeterLedgerDetail],
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def get_neighbor_meters(neighbor_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los medidores de un vecino con su historial de consumo y sus deudas
    """
    neighbor = neighbor.get_neighbor(db, neighbor_id=neighbor_id)
    if neighbor is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")

    return neighbor_meters.get_neighbor_meter_ledgers(db, neighbor_id=neighbor_id)


@router.post(
    "/{neighbor_id}/meters",
    response_model=schemas.NeighborMeter,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def create_neighbor_meter(
    neighbor_id: int,
    meter: schemas.NeighborMeterCreate,
    db: Session = Depends(get_db),
):
    """
    Registers a meter for an existing neighbor.

    The code is validated instead of trusted: the form filled it in from
    /meters/next-codes, and between that read and this write another collector
    may have taken it.
    """
    if neighbor.get_neighbor(db, neighbor_id=neighbor_id) is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")

    code = meter.meter_code.strip().upper()
    match = neighbor_meters.METER_CODE_PATTERN.match(code)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="El código debe tener el formato S-NNN, por ejemplo A-007",
        )

    if match.group(1) != meter.section.value:
        raise HTTPException(
            status_code=400,
            detail=f"El código {code} no corresponde a la sección {meter.section.value}",
        )

    if neighbor_meters.get_meter_by_code(db, meter_code=code):
        # Hand back the code that is free now, so the form can recover
        suggested = neighbor_meters.get_next_meter_codes(db)[meter.section.value]
        raise HTTPException(
            status_code=409,
            detail=f"El código {code} ya está registrado. El siguiente libre es {suggested}",
        )

    return neighbor_meters.create_neighbor_meter(
        db, neighbor_id=neighbor_id, meter=meter
    )


@router.get(
    "/{neighbor_id}/payments", dependencies=[Depends(require_roles(UserType.ADMIN))]
)
def get_neighbor_payments(neighbor_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los pagos realizados por un vecino con sus detalles
    """
    # Verificar que el vecino existe
    neighbor = neighbor.get_neighbor(db, neighbor_id=neighbor_id)
    if neighbor is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")

    # Obtener pagos
    payments = neighbor.get_neighbor_payments(db, neighbor_id=neighbor_id)

    # Formatear respuesta con detalles de cada pago
    payments_data = []
    for payment in payments:
        # Obtener detalles del pago (a qué deudas se aplicó)
        payment_details_list = []
        for detail in payment.payment_details:
            debt_item = detail.debt_item
            payment_details_list.append(
                {
                    "id": detail.id,
                    "debt_item_id": detail.debt_item_id,
                    "debt_reason": debt_item.reason if debt_item else "Desconocido",
                    "debt_type_name": debt_item.debt_type.name
                    if debt_item and debt_item.debt_type
                    else "Desconocido",
                    "amount_applied": detail.amount_applied,
                    "previous_balance": detail.previous_balance,
                    "new_balance": detail.new_balance,
                    "notes": detail.notes,
                }
            )
        payments_data.append(
            {
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
                "payment_details": payment_details_list,
            }
        )
    return payments_data


# ========== RUTAS DE DEUDAS ==========
def _neighbor_debts_response(neighbor, debts) -> dict:
    """
    Shared payload for both debt listings
    """
    neighbor_name = neighbor.full_name
    return {
        "neighbor_id": neighbor.id,
        "neighbor_name": neighbor_name,
        "total_debts": len(debts),
        "total_amount": sum(debt.amount for debt in debts),
        "debt_details": debts,
    }


@router.get(
    "/{neighbor_id}/debts/active",
    response_model=schemas.NeighborDebtsResponse,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def get_neighbor_active_debts(neighbor_id: int, db: Session = Depends(get_db)):
    """
    Obtiene las deudas pendientes de un vecino
    """
    neighbor = neighbor.get_neighbor(db, neighbor_id=neighbor_id)
    if neighbor is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")

    debts = debts_service.get_neighbor_debts(
        db, neighbor_id=neighbor_id, only_pending=True
    )
    return _neighbor_debts_response(neighbor, debts)


@router.get(
    "/{neighbor_id}/debts/all",
    response_model=schemas.NeighborDebtsResponse,
    dependencies=[Depends(require_roles(UserType.ADMIN))],
)
def get_neighbor_all_debts(neighbor_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todas las deudas de un vecino, incluyendo las pagadas
    """
    neighbor = neighbor.get_neighbor(db, neighbor_id=neighbor_id)
    if neighbor is None:
        raise HTTPException(status_code=404, detail="Neighbor not found")

    debts = debts_service.get_neighbor_debts(
        db, neighbor_id=neighbor_id, only_pending=False
    )
    return _neighbor_debts_response(neighbor, debts)
