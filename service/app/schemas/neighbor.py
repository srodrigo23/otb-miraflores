from pydantic import BaseModel, ConfigDict
from datetime import datetime

from .neighbor_meter import NeighborMeter


class NeighborBase(BaseModel):
  email: str | None = None


class NeighborCreate(BaseModel):
  first_name: str
  second_name: str | None = None
  last_name: str
  ci: str | int
  phone_number: str | int
  email: str | None = None


class NeighborUpdate(BaseModel):
  first_name: str
  second_name: str | None=None
  last_name: str
  ci: int | None=None
  phone_number: int | None=None
  email: str | None=None


class Neighbor(BaseModel):
  id: int
  first_name: str
  second_name: str | None = None
  last_name: str
  email: str | None = None
  ci: int | None = None
  phone_number: int | None = None

  class Config:
    from_attributes = True


class NeighborDetail(Neighbor):
  birth_day:datetime | None= None
  meters:list[NeighborMeter]
  is_active:bool
  # created_at:datetime # date
  # updated_at:datetime # date

  model_config = ConfigDict(from_attributes=True)
