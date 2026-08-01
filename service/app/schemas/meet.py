from pydantic import BaseModel


class MeetBase(BaseModel):
  meet_date: str  # DateTime as string
  meet_type: str
  title: str
  description: str | None = None
  location: str | None = None
  is_mandatory: bool = False
  organizer: str | None = None
  notes: str | None = None


class MeetCreate(MeetBase):
  pass


class MeetUpdate(BaseModel):
  meet_date: str | None = None
  meet_type: str | None = None
  title: str | None = None
  description: str | None = None
  location: str | None = None
  start_time: str | None = None
  end_time: str | None = None
  status: str | None = None
  is_mandatory: bool | None = None
  organizer: str | None = None
  notes: str | None = None


class Meet(BaseModel):
  id: int
  meet_date: str
  meet_type: str
  title: str
  description: str | None = None
  location: str | None = None
  start_time: str | None = None
  end_time: str | None = None
  status: str
  is_mandatory: bool
  total_neighbors: int
  total_present: int
  total_absent: int
  total_on_time: int
  organizer: str | None = None
  notes: str | None = None
  created_at: str
  updated_at: str

  class Config:
    from_attributes = True
