"""Pydantic schemas, one module per entity (mirroring `app/models/`).

Everything is re-exported here and in `schema.py` (kept as a backwards-compatible
facade), so both `from app.schemas import NeighborCreate` and the legacy
`from app.schemas import schema as schemas` style keep working.
"""

from .assistance import Assistance, AssistanceBase, AssistanceCreate, AssistanceUpdate
from .auth import LoginRequest, LoginSchema
from .collect_debt import CollectDebt, CollectDebtBase, CollectDebtCreate, CollectDebtUpdate
from .debt_item import DebtItemBase, DebtItemDetail, NeighborDebtsResponse
from .debt_type import DebtType, DebtTypeBase
from .item import Item, ItemBase, ItemCreate
from .measure import Measure, MeasureBase, MeasureCreate, MeasureUpdate
from .meet import Meet, MeetBase, MeetCreate, MeetUpdate
from .meter_reading import MeterReadingDetail, MeterReadingUpdate
from .neighbor import Neighbor, NeighborBase, NeighborCreate, NeighborDetail, NeighborUpdate
from .neighbor_meter import NeighborMeter
from .user import User, UserUpdate

__all__ = [
  "Assistance",
  "AssistanceBase",
  "AssistanceCreate",
  "AssistanceUpdate",
  "CollectDebt",
  "CollectDebtBase",
  "CollectDebtCreate",
  "CollectDebtUpdate",
  "DebtItemBase",
  "DebtItemDetail",
  "DebtType",
  "DebtTypeBase",
  "Item",
  "ItemBase",
  "ItemCreate",
  "LoginRequest",
  "LoginSchema",
  "Measure",
  "MeasureBase",
  "MeasureCreate",
  "MeasureUpdate",
  "Meet",
  "MeetBase",
  "MeetCreate",
  "MeetUpdate",
  "MeterReadingDetail",
  "MeterReadingUpdate",
  "Neighbor",
  "NeighborBase",
  "NeighborCreate",
  "NeighborDebtsResponse",
  "NeighborDetail",
  "NeighborMeter",
  "NeighborUpdate",
  "User",
  "UserUpdate",
]
