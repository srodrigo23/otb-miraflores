"""Backwards-compatible facade.

Schemas now live in one module per entity (mirroring `app/models/`). This module
re-exports all of them so existing `from app.schemas import schema as schemas`
imports and `schemas.X` references keep working. New code should import from the
entity module directly, e.g. `from app.schemas.neighbor import NeighborCreate`.
"""

from .assistance import Assistance, AssistanceBase, AssistanceCreate, AssistanceUpdate
from .auth import LoginRequest, LoginSchema
from .collect_debt import CollectDebt, CollectDebtBase, CollectDebtCreate, CollectDebtUpdate
from .debt_item import DebtItemBase, DebtItemDetail, NeighborDebtsResponse
from .debt_type import DebtType, DebtTypeBase
from .item import Item, ItemBase, ItemCreate
from .measure import Measure, MeasureBase, MeasureCreate, MeasureUpdate
from .meet import Meet, MeetBase, MeetCreate, MeetUpdate
from .meter_reading import MeterReadingDetail
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
