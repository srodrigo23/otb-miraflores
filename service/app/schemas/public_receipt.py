from datetime import datetime

from pydantic import BaseModel

from ..enums import DebtStatus


class PublicReceiptNeighbor(BaseModel):
  """Who the receipt belongs to. No contact details: this view is public"""
  full_name: str


class PublicReceiptDebt(BaseModel):
  """One period of one meter, paid or owed"""
  id: int
  period: str
  year: int
  meter_code: str
  consumption: int
  amount: int  # In cents
  status: DebtStatus
  # Only present once it was settled
  receipt_number: str | None = None
  paid_at: datetime | None = None


class PublicReceiptYear(BaseModel):
  """
  A "gestion": everything of one year, so the neighbor sees at a glance which
  years are settled and which are still owed
  """
  year: int
  paid_amount: int
  pending_amount: int
  paid_count: int
  pending_count: int
  debts: list[PublicReceiptDebt]


class PublicReceipt(BaseModel):
  """
  What a scanned QR resolves to: the receipt itself, plus where the neighbor
  stands across every year.
  """
  receipt_number: str
  reference: str
  paid_at: datetime | None = None
  amount: int  # In cents

  # What this particular receipt paid for
  period: str
  year: int
  meter_code: str
  consumption: int
  previous_reading: int
  current_reading: int

  neighbor: PublicReceiptNeighbor

  total_paid: int
  total_pending: int
  years: list[PublicReceiptYear]
