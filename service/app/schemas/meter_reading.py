from pydantic import AliasPath, BaseModel, ConfigDict, Field
from datetime import datetime

from ..enums import MeterReadingStatus


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

  meter_number: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "meter_code")
  )

  # Neighbor information, reached through the meter
  neighbor_first_name: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "first_name")
  )
  neighbor_second_name: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "second_name")
  )
  neighbor_last_name: str | None = Field(
    default=None, validation_alias=AliasPath("meter", "neighbor", "last_name")
  )

  created_at: datetime
  updated_at: datetime
