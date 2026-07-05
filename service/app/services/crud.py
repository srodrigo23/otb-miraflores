from sqlalchemy.orm import Session
# from sqlalchemy.orm import selectinload

from app.models.neighbor import Neighbor
from app.models.neighbor_meter import NeighborMeter
from app.models.user import User

from app.schemas import schema as schemas


def get_neighbor_by_id(db: Session, neighbor_id: int):
  return db.query(Neighbor, NeighborMeter)\
    .join(Neighbor.meters)\
    .filter(Neighbor.id == neighbor_id).all()
    # .options(selectinload(Neighbor.meters))\

def get_neighbor_by_email(db: Session, email: str):
    return db.query(Neighbor).filter(Neighbor.email == email).first()

def get_user_by_username(db: Session, username:str):
    return db.query(User).filter(User.username==username).first()


def get_neighbors(db: Session):
  return db.query(Neighbor).all()
  #.offset(skip).limit(limit) # to pagination


def create_neighbor(db: Session, neighbor: schemas.NeighborCreate):
    db_neighbor = Neighbor(
        first_name=neighbor.first_name,
        second_name=neighbor.second_name or "",
        last_name=neighbor.last_name,
        ci=neighbor.ci,
        phone_number=str(neighbor.phone_number),
        email=neighbor.email
    )
    db.add(db_neighbor)
    db.commit()
    db.refresh(db_neighbor)
    return db_neighbor


# def get_neighbor_meters(db: Session, neighbor_id: int):
#     """Obtiene todos los medidores de un vecino"""
#     return db.query(NeighborMeter).filter(NeighborMeter.neighbor_id == neighbor_id).all()


# def get_neighbor_payments(db: Session, neighbor_id: int):
#     """Obtiene todos los pagos de un vecino ordenados por fecha descendente"""
#     return db.query(Payment).filter(
#         Payment.neighbor_id == neighbor_id
#     ).order_by(Payment.payment_date.desc()).all()


# def get_items(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(Item).offset(skip).limit(limit).all()


# def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
#     db_item = Item(**item.model_dump(), owner_id=user_id)
#     db.add(db_item)
#     db.commit()
#     db.refresh(db_item)
#     return db_item


def update_neighbor(db: Session, neighbor_id: int, neighbor: schemas.NeighborUpdate):
    db_neighbor = db.query(Neighbor).filter(Neighbor.id == neighbor_id).first()
    if db_neighbor:
        update_data = neighbor.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_neighbor, key, value)
        db.commit()
        db.refresh(db_neighbor)
    return db_neighbor


def delete_neighbor(db: Session, neighbor_id: int):
    db_neighbor = db.query(Neighbor).filter(Neighbor.id == neighbor_id).first()
    if db_neighbor:
        db.delete(db_neighbor)
        db.commit()
        return True
    return False


# ========== DEUDAS ==========
# def get_neighbor_active_debts(db: Session, neighbor_id: int):
#     """
#     Obtiene todas las deudas activas (pending, partial, overdue) de un vecino
#     """
#     debts = db.query(DebtItem).filter(
#         DebtItem.neighbor_id == neighbor_id,
#         DebtItem.status.in_(["pending", "partial", "overdue"])
#     ).all()

#     return debts


# def get_neighbor_all_debts(db: Session, neighbor_id: int):
#     """
#     Obtiene todas las deudas de un vecino (incluyendo pagadas)
#     """
#     debts = db.query(DebtItem).filter(
#         DebtItem.neighbor_id == neighbor_id
#     ).all()

#     return debts


# def get_debt_item(db: Session, debt_id: int):
#     """
#     Obtiene una deuda específica por ID
#     """
#     return db.query(DebtItem).filter(DebtItem.id == debt_id).first()





# ========== REUNIONES ==========

# def get_meets(db: Session):
#     """
#     Obtiene todas las reuniones ordenadas por fecha de creación (más recientes primero)
#     """
#     return db.query(Meet).order_by(Meet.created_at.desc()).all()


# def get_meet(db: Session, meet_id: int):
#     """
#     Obtiene una reunión específica por ID
#     """
#     return db.query(Meet).filter(Meet.id == meet_id).first()


# def create_meet(db: Session, meet: schemas.MeetCreate):
#     """
#     Crea una nueva reunión
#     """
#     from datetime import datetime

#     # Convertir la fecha de string a objeto DateTime
#     meet_date = datetime.strptime(meet.meet_date, "%Y-%m-%dT%H:%M")

#     db_meet = Meet(
#         meet_date=meet_date,
#         meet_type=meet.meet_type,
#         title=meet.title,
#         description=meet.description,
#         location=meet.location,
#         is_mandatory=meet.is_mandatory,
#         organizer=meet.organizer,
#         notes=meet.notes,
#         status="scheduled",
#         total_neighbors=0,
#         total_present=0,
#         total_absent=0,
#         total_on_time=0
#     )
#     db.add(db_meet)
#     db.commit()
#     db.refresh(db_meet)
#     return db_meet


# def update_meet(db: Session, meet_id: int, meet: schemas.MeetUpdate):
#     """
#     Actualiza una reunión existente
#     """
#     db_meet = db.query(Meet).filter(Meet.id == meet_id).first()
#     if db_meet:
#         update_data = meet.model_dump(exclude_unset=True)

#         # Convertir fechas si se proporcionan
#         from datetime import datetime
#         if "meet_date" in update_data and update_data["meet_date"]:
#             update_data["meet_date"] = datetime.strptime(update_data["meet_date"], "%Y-%m-%dT%H:%M")
#         if "start_time" in update_data and update_data["start_time"]:
#             update_data["start_time"] = datetime.strptime(update_data["start_time"], "%Y-%m-%dT%H:%M")
#         if "end_time" in update_data and update_data["end_time"]:
#             update_data["end_time"] = datetime.strptime(update_data["end_time"], "%Y-%m-%dT%H:%M")

#         for key, value in update_data.items():
#             setattr(db_meet, key, value)
#         db.commit()
#         db.refresh(db_meet)
#     return db_meet


# def delete_meet(db: Session, meet_id: int):
#     """
#     Elimina una reunión
#     """
#     db_meet = db.query(Meet).filter(Meet.id == meet_id).first()
#     if db_meet:
#         db.delete(db_meet)
#         db.commit()
#         return True
#     return False


# def get_meet_assistances(db: Session, meet_id: int):
#     """
#     Obtiene todas las asistencias de una reunión específica
#     """
#     return db.query(Assistance).filter(Assistance.meet_id == meet_id).all()


# def create_assistance(db: Session, assistance: schemas.AssistanceCreate):
#     """
#     Crea un registro de asistencia
#     """
#     db_assistance = Assistance(
#         meet_id=assistance.meet_id,
#         neighbor_id=assistance.neighbor_id,
#         is_present=assistance.is_present,
#         is_on_time=assistance.is_on_time
#     )
#     db.add(db_assistance)
#     db.commit()
#     db.refresh(db_assistance)

#     # Actualizar estadísticas de la reunión
#     update_meet_statistics(db, assistance.meet_id)

#     return db_assistance


# def update_assistance(db: Session, assistance_id: int, assistance: schemas.AssistanceUpdate):
#     """
#     Actualiza un registro de asistencia
#     """
#     db_assistance = db.query(Assistance).filter(Assistance.id == assistance_id).first()
#     if db_assistance:
#         update_data = assistance.model_dump(exclude_unset=True)

#         # Convertir fechas si se proporcionan
#         from datetime import datetime
#         if "arrival_time" in update_data and update_data["arrival_time"]:
#             update_data["arrival_time"] = datetime.strptime(update_data["arrival_time"], "%Y-%m-%dT%H:%M")
#         if "departure_time" in update_data and update_data["departure_time"]:
#             update_data["departure_time"] = datetime.strptime(update_data["departure_time"], "%Y-%m-%dT%H:%M")

#         for key, value in update_data.items():
#             setattr(db_assistance, key, value)
#         db.commit()
#         db.refresh(db_assistance)

#         # Actualizar estadísticas de la reunión
#         update_meet_statistics(db, db_assistance.meet_id)

#     return db_assistance


# def update_meet_statistics(db: Session, meet_id: int):
#     """
#     Actualiza las estadísticas de asistencia de una reunión
#     """
#     meet = db.query(Meet).filter(Meet.id == meet_id).first()
#     if meet:
#         # Obtener todas las asistencias de esta reunión
#         assistances = db.query(Assistance).filter(Assistance.meet_id == meet_id).all()

#         # Calcular estadísticas
#         total_neighbors = len(assistances)
#         total_present = sum(1 for a in assistances if a.is_present)
#         total_absent = sum(1 for a in assistances if not a.is_present)
#         total_on_time = sum(1 for a in assistances if a.is_on_time)

#         # Actualizar el registro de la reunión
#         meet.total_neighbors = total_neighbors
#         meet.total_present = total_present
#         meet.total_absent = total_absent
#         meet.total_on_time = total_on_time

#         db.commit()
#         db.refresh(meet)
#     return meet


# ========== RECAUDACIONES ==========

# def get_collect_debts(db: Session):
#     """
#     Obtiene todas las recaudaciones ordenadas por fecha de creación (más recientes primero)
#     """
#     return db.query(CollectDebt).order_by(CollectDebt.created_at.desc()).all()


# def get_collect_debt(db: Session, collect_debt_id: int):
#     """
#     Obtiene una recaudación específica por ID
#     """
#     return db.query(CollectDebt).filter(CollectDebt.id == collect_debt_id).first()


# def create_collect_debt(db: Session, collect_debt: schemas.CollectDebtCreate):
#     """
#     Crea una nueva recaudación
#     """
#     from datetime import datetime

#     # Convertir la fecha de string a objeto Date
#     collect_date = datetime.strptime(collect_debt.collect_date, "%Y-%m-%d").date()

#     db_collect_debt = CollectDebt(
#         collect_date=collect_date,
#         period=collect_debt.period,
#         collector_name=collect_debt.collector_name,
#         location=collect_debt.location,
#         notes=collect_debt.notes,
#         status="in_progress",
#         total_payments=0,
#         total_collected=0,
#         total_neighbors_paid=0
#     )
#     db.add(db_collect_debt)
#     db.commit()
#     db.refresh(db_collect_debt)
#     return db_collect_debt


# def update_collect_debt(db: Session, collect_debt_id: int, collect_debt: schemas.CollectDebtUpdate):
#     """
#     Actualiza una recaudación existente
#     """
#     db_collect_debt = db.query(CollectDebt).filter(CollectDebt.id == collect_debt_id).first()
#     if db_collect_debt:
#         update_data = collect_debt.model_dump(exclude_unset=True)

#         # Convertir fechas si se proporcionan
#         from datetime import datetime
#         if "collect_date" in update_data and update_data["collect_date"]:
#             update_data["collect_date"] = datetime.strptime(update_data["collect_date"], "%Y-%m-%d").date()
#         if "start_time" in update_data and update_data["start_time"]:
#             update_data["start_time"] = datetime.strptime(update_data["start_time"], "%Y-%m-%dT%H:%M")
#         if "end_time" in update_data and update_data["end_time"]:
#             update_data["end_time"] = datetime.strptime(update_data["end_time"], "%Y-%m-%dT%H:%M")

#         for key, value in update_data.items():
#             setattr(db_collect_debt, key, value)
#         db.commit()
#         db.refresh(db_collect_debt)
#     return db_collect_debt


# def delete_collect_debt(db: Session, collect_debt_id: int):
#     """
#     Elimina una recaudación
#     """
#     db_collect_debt = db.query(CollectDebt).filter(CollectDebt.id == collect_debt_id).first()
#     if db_collect_debt:
#         db.delete(db_collect_debt)
#         db.commit()
#         return True
#     return False