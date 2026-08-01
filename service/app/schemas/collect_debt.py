from pydantic import BaseModel


class CollectDebtBase(BaseModel):
  collect_date: str  # Date as string
  period: str | None = None
  collector_name: str | None = None
  location: str | None = None
  notes: str | None = None


class CollectDebtCreate(CollectDebtBase):
  pass


class CollectDebtUpdate(BaseModel):
  collect_date: str | None = None
  period: str | None = None
  collector_name: str | None = None
  location: str | None = None
  status: str | None = None
  total_payments: int | None = None
  total_collected: int | None = None
  total_neighbors_paid: int | None = None
  start_time: str | None = None
  end_time: str | None = None
  notes: str | None = None


class CollectDebt(BaseModel):
  id: int
  collect_date: str
  period: str | None = None
  collector_name: str | None = None
  location: str | None = None
  status: str
  total_payments: int
  total_collected: int
  total_neighbors_paid: int
  start_time: str | None = None
  end_time: str | None = None
  notes: str | None = None
  created_at: str
  updated_at: str

  class Config:
    from_attributes = True
