from sqlalchemy.orm import Session
# from sqlalchemy.orm import selectinload

from app.models.neighbor import Neighbor
from app.models.neighbor_meter import NeighborMeter
from app.models.user import User

from app.schemas import schema as schemas


def get_neighbor(db: Session, neighbor_id: int):
  """
  A single neighbor. get_neighbor_by_id below returns (Neighbor, NeighborMeter)
  rows instead, which is what the detail view needs
  """
  return db.query(Neighbor).filter(Neighbor.id == neighbor_id).first()

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
