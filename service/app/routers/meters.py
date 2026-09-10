from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

import app.services.neighbor_meters as neighbor_meters
from ..schemas.neighbor_meter import NextMeterCodes
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
