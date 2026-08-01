from pydantic import BaseModel


class MeterReading(BaseModel):
  id: int
  meter_id: int
  measure_id: int
  current_reading: int
  reading_date: str
  status: str
  has_anomaly: bool
  notes: str | None = None
  created_at: str
  updated_at: str

  # Neighbor and meter information
  neighbor_first_name: str | None = None
  neighbor_second_name: str | None = None
  neighbor_last_name: str | None = None
  neighbor_ci: str | None = None
  meter_number: str | None = None

  class Config:
    from_attributes = True
