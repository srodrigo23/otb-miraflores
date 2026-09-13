from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime

from .neighbor_meter import NeighborMeter


class NeighborBase(BaseModel):
  email: str | None = None


class NeighborCreate(BaseModel):
  """
  Only the names are required, matching the model: a neighbor may be on the
  register without a CI or a phone on record. Meters are registered apart.
  """
  names: str = Field(min_length=1)
  pat_lname: str = Field(min_length=1)
  mat_lname: str | None = None
  ci: int | None = None
  phone_number: int | None = None
  email: EmailStr | None = None


class NeighborUpdate(BaseModel):
  names: str
  pat_lname: str
  mat_lname: str | None=None
  ci: int | None=None
  phone_number: int | None=None
  email: str | None=None


class Neighbor(BaseModel):
  id: int
  names: str
  pat_lname: str
  mat_lname: str | None = None
  email: str | None = None
  ci: int | None = None
  phone_number: int | None = None

  class Config:
    from_attributes = True


class NeighborDetail(Neighbor):
  # Defaults to empty: a neighbor may exist before any meter is registered
  meters: list[NeighborMeter] = []
  # birth_day and is_active are commented out in the Neighbor model
  # created_at:datetime # date
  # updated_at:datetime # date

  model_config = ConfigDict(from_attributes=True)
