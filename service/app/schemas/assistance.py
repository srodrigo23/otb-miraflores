from pydantic import BaseModel


class AssistanceBase(BaseModel):
  neighbor_id: int
  is_present: bool = False
  is_on_time: bool = False


class AssistanceCreate(AssistanceBase):
  meet_id: int


class AssistanceUpdate(BaseModel):
  is_present: bool | None = None
  is_on_time: bool | None = None
  arrival_time: str | None = None
  departure_time: str | None = None
  excuse_reason: str | None = None
  has_excuse: bool | None = None
  represented_by: str | None = None
  has_representative: bool | None = None
  notes: str | None = None


class Assistance(BaseModel):
  id: int
  meet_id: int
  neighbor_id: int
  neighbor_name: str | None = None  # Included to carry the neighbor's name
  is_present: bool
  is_on_time: bool
  arrival_time: str | None = None
  departure_time: str | None = None
  excuse_reason: str | None = None
  has_excuse: bool
  represented_by: str | None = None
  has_representative: bool
  notes: str | None = None

  class Config:
    from_attributes = True
