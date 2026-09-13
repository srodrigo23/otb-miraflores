from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field


class PaymentCreate(BaseModel):
  """
  What the collector fills in when settling a debt.

  Neither the amount nor the moment are here: a debt is paid in full, and it is
  paid now, so both are settled by the server and cannot be argued by the
  client.
  """
  received_by: str | None = Field(default=None, max_length=100)


class NextReceiptNumber(BaseModel):
  """What the next payment's receipt will read"""
  receipt_number: str


class PaymentRecord(BaseModel):
  """
  A payment as the payments screen lists it: flattened, with the meter and the
  neighbor already resolved so the table reads no relationships.
  """
  id: int
  receipt: str
  meter_code: str
  neighbor_name: str
  period: str
  year: int
  # Who collected it. Null for the seeded history, taken on paper
  collector_name: str | None = None
  amount: int  # In cents
  # Null for the seeded history: the sheets carry no date
  paid_at: datetime | None = None


class Payment(BaseModel):
  """A settled debt, as the receipt and the ledger need it"""
  model_config = ConfigDict(from_attributes=True)

  id: int
  debt_item_id: int
  neighbor_id: int
  paid_at: datetime | None = None
  amount: int  # In cents
  # Opaque id the receipt QR points at
  reference: str
  received_by: str | None = None
  created_at: datetime

  @computed_field
  @property
  def receipt_number(self) -> str:
    """The id, zero padded. Formatted here so nobody formats it twice"""
    return f"{self.id:06d}"
