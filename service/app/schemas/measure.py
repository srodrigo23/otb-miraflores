from pydantic import BaseModel, ConfigDict
from datetime import datetime

from ..enums import MeasureType


class MeasureBase(BaseModel):
  measure_date: str  # Date as string
  period: str | None = None
  reader_name: str | None = None
  notes: str | None = None


class MeasureCreate(MeasureBase):
  pass


class MeasureUpdate(BaseModel):
  measure_date: datetime | None = None
  period: str | None = None
  reader_name: str | None = None
  status: str | None = None
  total_meters: int | None = None
  meters_read: int | None = None
  meters_pending: int | None = None
  notes: str | None = None

  model_config = ConfigDict(from_attributes=True) # Enables ORM/object casting


class Measure(BaseModel):
  id: int
  measure_date: datetime
  period: str | None = None
  reader_name: str | None = None
  status: MeasureType
  notes: str | None = None
  created_at: datetime
  updated_at: datetime

  # @field_validator('status', mode='before')
  # @classmethod
  # def extract_enum_value(cls, v):
  #   if isinstance(v, MeasureType):
  #     return v.value
  #   return v

  class Config:
    from_attributes = True
    use_enum_values = True
