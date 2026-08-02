from enum import Enum

class UserType(Enum):
  
  ADMIN = 'admin'
  COLLECTOR = 'collector'
  
class MeasureType(Enum):
  CREATED = "CREATED"
  IN_PROGRESS = "IN_PROGRESS"
  CLOSED = "CLOSED" 
  
class MeterReadingStatus(Enum):
  UNREAD = "UNREAD"
  READED = "READED"
  METER_ERROR = "METER_ERROR"

class DebtOrigin(Enum):
  """What the debt was charged for. Replaces the debt_types lookup table"""
  WATER_CONSUMPTION = "WATER_CONSUMPTION"

class DebtStatus(Enum):
  PENDING = "PENDING"
  PARTIAL = "PARTIAL"
  PAID = "PAID"
  CANCELLED = "CANCELLED"