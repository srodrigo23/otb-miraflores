from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class NeighborMeter(Base):
  """Medidores asociados a cada vecino"""
  __tablename__ = "neighbor_meters"

  id = Column(Integer, primary_key=True, index=True)
  neighbor_id = Column(Integer, ForeignKey("neighbors.id"), nullable=False)
  
  meter_code = Column(String, unique=True, nullable=False)
  section = Column(String, nullable=False)
  
  is_active = Column(Boolean, default=True)  # Si el medidor está activo
  notes = Column(String(200))  # Notas adicionales sobre el medidor
  
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relaciones
  neighbor = relationship("Neighbor", back_populates="meters")
  readings = relationship("MeterReading", back_populates="meter", cascade="all, delete-orphan")