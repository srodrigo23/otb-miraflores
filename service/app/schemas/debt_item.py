from pydantic import BaseModel


class DebtItemBase(BaseModel):
  neighbor_id: int
  debt_type_id: int
  amount: int
  reason: str
  period: str | None = None


class DebtItemDetail(BaseModel):
  id: int
  neighbor_id: int
  debt_type_id: int
  debt_type_name: str  # Debt type name
  meter_reading_id: int | None = None
  assistance_id: int | None = None
  amount: int  # Total amount in cents
  amount_paid: int  # Amount already paid
  balance: int  # Outstanding balance
  reason: str
  period: str | None = None
  issue_date: str
  due_date: str | None = None
  paid_date: str | None = None
  status: str
  is_overdue: bool
  late_fee: int
  discount: int
  notes: str | None = None

  class Config:
    from_attributes = True


# Response schema for a neighbor's debts
class NeighborDebtsResponse(BaseModel):
  neighbor_id: int
  neighbor_name: str
  total_debts: int  # Total active debts
  total_amount: int  # Total amount owed in cents
  total_balance: int  # Total outstanding balance
  debt_details: list[DebtItemDetail]
