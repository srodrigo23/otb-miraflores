from pydantic import BaseModel


class NeighborMeter(BaseModel):
  id: int
  meter_code:str
  section:str
  initial_reading:int = 0
  is_active:bool
