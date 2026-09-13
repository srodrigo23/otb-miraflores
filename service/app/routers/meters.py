from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

import app.services.neighbor_meters as neighbor_meters
from ..schemas.neighbor_meter import (
  NeighborMeter,
  NeighborMeterUpdate,
  NextMeterCodes,
)
from ..db.database import get_db

router = APIRouter(
  prefix="/meters",
  tags=['Meters'],
  responses={404: {"description": "Not found"}}
)


@router.get("/next-codes", response_model=NextMeterCodes)
def read_next_meter_codes(db: Session = Depends(get_db)):
  """
  The next free meter code of every section.

  The new-meter form reads this once when it opens and picks from the map as
  the user changes section, instead of asking again on every change.
  """
  return NextMeterCodes(codes=neighbor_meters.get_next_meter_codes(db))


@router.patch("/{meter_id}", response_model=NeighborMeter)
def update_meter(
  meter_id: int,
  changes: NeighborMeterUpdate,
  db: Session = Depends(get_db),
):
  """
  Enables or disables a meter. Nothing else about it can be changed: its code,
  section and initial reading already anchor its readings and debts.
  """
  meter = neighbor_meters.get_meter_by_id(db, meter_id=meter_id)
  if meter is None:
    raise HTTPException(status_code=404, detail="Medidor no encontrado")

  return neighbor_meters.set_meter_active(db, meter=meter, is_active=changes.is_active)
