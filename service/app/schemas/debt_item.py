from pydantic import AliasPath, BaseModel, ConfigDict, Field
from datetime import datetime

from ..enums import DebtOrigin, DebtStatus


class DebtItemDetail(BaseModel):
  """
  Output schema for a debt, flattened with the meter and neighbor it belongs to.
  The AliasPath fields walk DebtItem -> meter_reading -> meter -> neighbor.
  """
  model_config = ConfigDict(from_attributes=True)

  id: int
  neighbor_id: int
  meter_reading_id: int | None = None
  origin: DebtOrigin
  status: DebtStatus

  consumption: int | None = None
  amount: int  # Total amount in cents
  amount_paid: int

  notes: str | None = None

  # Reading that originated the debt
  previous_reading: int | None = Field(
    default=None, validation_alias=AliasPath("meter_reading", "previous_reading")
  )
  current_reading: int | None = Field(
    default=None, validation_alias=AliasPath("meter_reading", "current_reading")
  )
  meter_number: str | None = Field(
    default=None, validation_alias=AliasPath("meter_reading", "meter", "meter_code")
  )
  section: str | None = Field(
    default=None, validation_alias=AliasPath("meter_reading", "meter", "section")
  )

  # Neighbor information
  neighbor_first_name: str | None = Field(
    default=None, validation_alias=AliasPath("neighbor", "first_name")
  )
  neighbor_second_name: str | None = Field(
    default=None, validation_alias=AliasPath("neighbor", "second_name")
  )
  neighbor_last_name: str | None = Field(
    default=None, validation_alias=AliasPath("neighbor", "last_name")
  )

  created_at: datetime
  updated_at: datetime


class NeighborDebtsResponse(BaseModel):
  """Summary of what a neighbor owes"""
  neighbor_id: int
  neighbor_name: str
  total_debts: int
  total_amount: int  # Total owed in cents
  total_paid: int
  debt_details: list[DebtItemDetail]
