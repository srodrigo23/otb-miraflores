from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class NeighborMeter(Base):
  """Meters associated with each neighbor"""
  __tablename__ = "neighbor_meters"

  id = Column(Integer, primary_key=True, index=True)
  neighbor_id = Column(Integer, ForeignKey("neighbors.id"), nullable=False)

  meter_code = Column(String, unique=True, nullable=False)
  section = Column(String, nullable=False)

  initial_reading = Column(Integer, default=0, nullable=False)  # Meter reading when it was installed/registered
  is_active = Column(Boolean, default=True)  # Whether the meter is active
  notes = Column(String(200))  # Additional notes about the meter

  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
  # Relationships
  neighbor = relationship("Neighbor", back_populates="meters")
  readings = relationship("MeterReading", back_populates="meter", cascade="all, delete-orphan")