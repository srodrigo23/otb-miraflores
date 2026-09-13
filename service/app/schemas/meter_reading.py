from pydantic import AliasPath, BaseModel, ConfigDict, Field
from datetime import datetime

from ..enums import MeterReadingStatus


class MeterReadingUpdate(BaseModel):
  """
  Editable fields of a reading. Everything else about it is derived
  """
  current_reading: int = Field(ge=0)
  notes: str | None = Field(default=None, max_length=200)


class MeterReadingDetail(BaseModel):
  """
  Output schema for a meter reading, flattened with its meter and neighbor data.
  The AliasPath fields walk the ORM relationships (MeterReading.meter.neighbor),
  so endpoints can return the ORM objects and FastAPI builds the response.
  """
  model_config = ConfigDict(from_attributes=True)

  id: int
  meter_id: int
  measure_id: int
  current_reading: int
  status: MeterReadingStatus
  notes: str | None = None

  previous_reading: int = 0

  # Meter information
  meter_number: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "meter_code")
  )
  section: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "section")
  )

  # Neighbor information, reached through the meter
  neighbor_names: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "names")
  )
  neighbor_mat_lname: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "mat_lname")
  )
  neighbor_pat_lname: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "pat_lname")
  )

  created_at: datetime
  updated_at: datetime
