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
  first_name: str = Field(min_length=1)
  second_name: str | None = None
  last_name: str = Field(min_length=1)
  ci: int | None = None
  phone_number: int | None = None
  email: EmailStr | None = None


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
  # Defaults to empty: a neighbor may exist before any meter is registered
  meters: list[NeighborMeter] = []
  # birth_day and is_active are commented out in the Neighbor model
  # created_at:datetime # date
  # updated_at:datetime # date

  model_config = ConfigDict(from_attributes=True)
