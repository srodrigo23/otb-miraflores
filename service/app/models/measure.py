from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.enums import MeasureType

from app.db.database import Base

class Measure(Base):
  __tablename__ = "measures"

  id = Column(Integer, primary_key=True, index=True)

  measure_date = Column(Date, nullable=False, index=True)
  period = Column(String)  # Period (ej: "2025-01", "Enero 2025")

  reader_name = Column(String)
  status = Column(Enum(MeasureType), default=MeasureType.CREATED)  

  notes = Column(String(200))
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relaciones
  meter_readings = relationship("MeterReading", back_populates="measure", cascade="all, delete-orphan")
