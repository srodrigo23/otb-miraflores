from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

import app.services.debts as debts_service
from ..schemas.payment import PaymentRecord
from ..db.database import get_db

router = APIRouter(
  prefix="/payments",
  tags=['Payments'],
  responses={404: {"description": "Not found"}}
)


@router.get("", response_model=list[PaymentRecord])
def read_payments(db: Session = Depends(get_db)):
  """
  Every payment collected, newest first.

  The screen filters by date, collector and text in memory, so the whole list
  travels once instead of a request per keystroke.
  """
  return debts_service.get_payments(db)
