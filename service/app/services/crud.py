from sqlalchemy.orm import Session, selectinload

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
  """
  The neighbor with its meters, or None if there is no such neighbor.

  It used to join Neighbor with NeighborMeter, which is an inner join: a
  neighbor with no meter yet produced zero rows and the detail answered 404.
  selectinload asks for the meters in a second query instead, so a neighbor
  without any simply comes back with `meters == []`.
  """
  return db.query(Neighbor)\
    .options(selectinload(Neighbor.meters))\
    .filter(Neighbor.id == neighbor_id)\
    .first()

def get_neighbor_by_email(db: Session, email: str):
    return db.query(Neighbor).filter(Neighbor.email == email).first()

def get_user_by_username(db: Session, username:str):
    return db.query(User).filter(User.username==username).first()


def get_neighbors(db: Session):
  return db.query(Neighbor).all()
  #.offset(skip).limit(limit) # to pagination


def get_neighbor_by_ci(db: Session, ci: int):
  return db.query(Neighbor).filter(Neighbor.ci == ci).first()


def create_neighbor(db: Session, neighbor: schemas.NeighborCreate):
  """
  Names are stored upper-cased, the way the register lists them. No meter is
  created here: meters are registered separately against an existing neighbor.
  """
  db_neighbor = Neighbor(
    first_name=neighbor.first_name.strip().upper(),
    second_name=(neighbor.second_name or "").strip().upper(),
    last_name=neighbor.last_name.strip().upper(),
    # ci and phone_number are Integer columns: keep them numeric or null
    ci=neighbor.ci,
    phone_number=neighbor.phone_number,
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
