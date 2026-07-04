
from sqlalchemy import Boolean, Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


"""
With only ForeignKey (no relationship()), you join explicitly in queries:
1. Lazy join — one query, access via ForeignKey column:
db.query(NeighborMeter).join(Neighbor).filter(Neighbor.ci == 123).all()
2. Navigate from meter to neighbor (two queries):
meter = db.query(NeighborMeter).first()
neighbor = db.query(Neighbor).filter_by(id=meter.neighbor_id).first()
3. Navigate from neighbor to meters (two queries):
neighbor = db.query(Neighbor).first()
meters = db.query(NeighborMeter).filter_by(neighbor_id=neighbor.id).all()
4. Eager load with contains_eager or joinedload (still no relationship):
from sqlalchemy.orm import joinedload

query = (
    db.query(Neighbor)
    .outerjoin(NeighborMeter, Neighbor.id == NeighborMeter.neighbor_id)
    .options(joinedload(NeighborMeter))  # requires relationship on NeighborMeter
)
Without relationship, you can't use joinedload/selectinload — you'd always write the join and pluck the columns manually:
results = (
    db.query(Neighbor, NeighborMeter)
    .outerjoin(NeighborMeter, Neighbor.id == NeighborMeter.neighbor_id)
    .all()
)
for neighbor, meter in results:
    print(neighbor.first_name, meter.meter_code if meter else None)
You get full type safety and DB integrity from ForeignKey. relationship() only saves you from writing explicit join/filter boilerplate and enables ORM-level features like cascade deletes and lazy/eager loading strategies.
"""
class Neighbor(Base):
  __tablename__ = "neighbors"

  id = Column(Integer, primary_key=True, index=True)

  first_name = Column(String(30), unique=False, nullable=False)
  second_name = Column(String(30), default="")
  last_name = Column(String(30))

  ci = Column(Integer, nullable=True)
  phone_number = Column(Integer, nullable=True)
  email = Column(String(50), nullable=True)
  birth_day = Column(Date)
  section = Column(String(50), nullable=True)

  is_active = Column(Boolean, default=True)  # Si el vecino está activo
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
  
  # Relaciones
  meters = relationship("NeighborMeter", back_populates="neighbor", cascade="all, delete-orphan")
  
  
  # assistances = relationship("Assistance", back_populates="neighbor", cascade="all, delete-orphan")
  # debts = relationship("DebtItem", back_populates="neighbor", cascade="all, delete-orphan")
  
