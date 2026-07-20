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