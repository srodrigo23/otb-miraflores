from pydantic import BaseModel


class DebtTypeBase(BaseModel):
  name: str
  description: str | None = None


class DebtType(DebtTypeBase):
  id: int
  created_at: str
  updated_at: str

  class Config:
    from_attributes = True
