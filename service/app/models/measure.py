from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Enum, case
from sqlalchemy.orm import relationship
from datetime import datetime
from app.enums import MeasurePeriod, MeasureType

from app.db.database import Base

# Position of each period inside a year. Measures used to be ordered by their
# date; without it, "year + period" is what puts them in sequence, and the
# period has to sort by the calendar and not alphabetically.
PERIOD_ORDER = {period.value: index for index, period in enumerate(MeasurePeriod)}


def measure_rank(measure) -> int:
  """A single sortable number for a measure, e.g. 2026-MAYO-JUNIO -> 202602"""
  return (measure.year or 0) * 100 + PERIOD_ORDER.get(measure.period, 0)


def measure_rank_expr():
  """The same number as a SQL expression, to order and compare in queries"""
  return Measure.year * 100 + case(
    PERIOD_ORDER, value=Measure.period, else_=0
  )


class Measure(Base):
  __tablename__ = "measures"

  id = Column(Integer, primary_key=True, index=True)
  # measure_date = Column(Date, nullable=False, index=True)
  period = Column(String)
  year = Column(Integer)

  reader_name = Column(String)
  status = Column(Enum(MeasureType), default=MeasureType.CREATED)

  notes = Column(String(200), nullable=True)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relaciones
  meter_readings = relationship("MeterReading", back_populates="measure", cascade="all, delete-orphan")
