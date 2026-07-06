from enum import Enum

class UserType(Enum):
  
  ADMIN = 'admin'
  COLLECTOR = 'collector'
  
class MeasureType(Enum):
  CREATED = "CREATED"
  IN_PROGRESS = "IN_PROGRESS"
  CLOSED = "CLOSED" 