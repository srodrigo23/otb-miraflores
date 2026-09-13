from enum import Enum

class UserType(Enum):
  
  ADMIN = 'admin'
  COLLECTOR = 'collector'
  
class MeasureType(Enum):
  CREATED = "CREATED"
  IN_PROGRESS = "IN_PROGRESS"
  CLOSED = "CLOSED" 
  
class MeterSection(Enum):
  """The sections the OTB is divided into. Every meter belongs to one."""
  A = "A"
  B = "B"
  C = "C"
  D = "D"
  E = "E"
  F = "F"
  
class MeasurePeriod(Enum):
  """
  The six two-month periods a measure can belong to, declared in calendar
  order: that order is what tells which measure came before another now that
  measures no longer carry a date.
  """
  ENERO_FEBRERO = "ENERO-FEBRERO"
  MARZO_ABRIL = "MARZO-ABRIL"
  MAYO_JUNIO = "MAYO-JUNIO"
  JULIO_AGOSTO = "JULIO-AGOSTO"
  SEPTIEMBRE_OCTUBRE = "SEPTIEMBRE-OCTUBRE"
  NOVIEMBRE_DICIEMBRE = "NOVIEMBRE-DICIEMBRE"

  @classmethod
  def for_month(cls, month: int) -> "MeasurePeriod":
    """The period a calendar month (1-12) falls into"""
    return list(cls)[(month - 1) // 2]

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