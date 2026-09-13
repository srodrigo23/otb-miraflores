from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base
from app.enums import MeterReadingStatus

class MeterReading(Base):
  
  __tablename__ = "meter_readings"

  id = Column(Integer, primary_key=True, index=True)
  measure_id = Column(Integer, ForeignKey("measures.id"), nullable=False)
  meter_id = Column(Integer, ForeignKey("neighbor_meters.id"), nullable=False)

  current_reading = Column(Integer, nullable=True, default=0)
  # The previous value is derived, not stored: it is the last READED reading of
  # this same meter, resolved by neighbor_meters.get_previous_reading_map
  # previous_reading = Column(Integer, nullable=True, default=0)
  # consumption = Column(Integer)  # Consumo calculado (current_reading - previous_reading)

  # reading_date = Column(DateTime, default=datetime.utcnow)  # Fecha y hora exacta de la lectura
  # reader_name = Column(String(100))  # Persona que realizó esta lectura específica

  status = Column(Enum(MeterReadingStatus), default=MeterReadingStatus.UNREAD)  # normal, not_read, meter_error
  # has_anomaly = Column(Boolean, default=False)  # Si hay alguna anomalía detectada

  notes = Column(String(200))  # Observaciones específicas de esta lectura
  # photo_url = Column(String(200))  # URL de la foto del medidor (opcional)

  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relaciones
  measure = relationship("Measure", back_populates="meter_readings")
  meter = relationship("NeighborMeter", back_populates="readings")
  # One debt per reading, so uselist=False turns it into a single object
  debt_item = relationship("DebtItem", back_populates="meter_reading", uselist=False, cascade="all, delete-orphan")
