from pydantic import BaseModel, ConfigDict

from ..enums import DebtStatus


class NeighborMeter(BaseModel):
  id: int
  meter_code:str
  section:str
  initial_reading:int = 0
  is_active:bool


class ConsumptionPoint(BaseModel):
  """One period of the meter's consumption history"""
  period: str
  year: int
  consumption: int


class MeterDebtSummary(BaseModel):
  """A debt as the neighbor's meter view needs it: what was read and what it cost"""
  model_config = ConfigDict(from_attributes=True)

  id: int
  period: str
  year: int
  previous_reading: int
  current_reading: int
  consumption: int
  amount: int  # Total amount in cents
  status: DebtStatus


class MeterLedgerPayment(BaseModel):
  """
  Placeholder shape for a payment. Nothing fills it yet: the Payment and
  PaymentDetail models are still parked in models/unused_models/
  """
  id: int
  receipt: str
  date: str
  period: str
  amount: int
  method: str


class MeterLedgerDetail(BaseModel):
  """Everything the neighbor detail view shows for one of their meters"""
  id: int
  meter_code: str
  section: str
  initial_reading: int
  is_active: bool

  # Oldest first, so the consumption line reads left to right
  history: list[ConsumptionPoint]
  debts: list[MeterDebtSummary]
  payments: list[MeterLedgerPayment]
