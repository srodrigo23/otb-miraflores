from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base
from app.enums import DebtOrigin, DebtStatus


class DebtItem(Base):
  """
  Debts owed by neighbors. Today the only origin is water consumption:
  one debt per meter reading.
  """
  __tablename__ = "debt_items"

  id = Column(Integer, primary_key=True, index=True)
  neighbor_id = Column(Integer, ForeignKey("neighbors.id"), nullable=False)

  # One debt per reading: the unique constraint keeps a reading from being
  # billed twice. Nullable so debts from other origins can exist later
  meter_reading_id = Column(Integer, ForeignKey("meter_readings.id"), unique=True)

  origin = Column(Enum(DebtOrigin), nullable=False, default=DebtOrigin.WATER_CONSUMPTION)

  # Billed cubic meters, stored at generation time: recomputing it later would
  # depend on readings that may have been edited since
  consumption = Column(Integer)

  amount = Column(Integer, nullable=False)  # Total amount in cents
  # amount_paid = Column(Integer, nullable=False, default=0)

  status = Column(Enum(DebtStatus), nullable=False, default=DebtStatus.PENDING)
  
  notes = Column(String(200))

  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relationships
  neighbor = relationship("Neighbor", back_populates="debts")
  meter_reading = relationship("MeterReading", back_populates="debt_item")

  # Pending models, kept out until they are activated (see models/unused_models/):
  # debt_type = relationship("DebtType", back_populates="debt_items")
  # assistance = relationship("Assistance", back_populates="debt_item")
  # payment_details = relationship("PaymentDetail", back_populates="debt_item", cascade="all, delete-orphan")
