from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

import app.services.debts as debts_service
from ..schemas.payment import NextReceiptNumber, Payment, PaymentCreate
from ..schemas.debt_item import DebtItemDetail
from ..enums import DebtStatus
from ..db.database import get_db

router = APIRouter(
  prefix="/debts",
  tags=['Debts'],
  responses={404: {"description": "Not found"}}
)


@router.get("/next-receipt-number", response_model=NextReceiptNumber)
def read_next_receipt_number(db: Session = Depends(get_db)):
  """
  What the next payment's receipt will read, so the form can show it before
  the row exists. The printed number is the id the database assigns.
  """
  return NextReceiptNumber(
    receipt_number=debts_service.get_next_receipt_number(db)
  )


def _get_debt_or_404(db: Session, debt_id: int):
  debt = debts_service.get_debt(db, debt_id=debt_id)
  if debt is None:
    raise HTTPException(status_code=404, detail="Deuda no encontrada")
  return debt


@router.post(
  "/{debt_id}/payment",
  response_model=Payment,
  status_code=status.HTTP_201_CREATED,
)
def pay_debt(debt_id: int, data: PaymentCreate, db: Session = Depends(get_db)):
  """
  Settles a debt in full and marks it PAID.

  The amount is not taken from the request: a debt is paid whole, so it comes
  from the debt itself and the receipt cannot disagree with what was owed.
  """
  debt = _get_debt_or_404(db, debt_id)

  if debt.status == DebtStatus.PAID:
    raise HTTPException(status_code=409, detail="La deuda ya fue pagada")

  if debt.status == DebtStatus.CANCELLED:
    raise HTTPException(
      status_code=409, detail="La deuda está anulada y no se puede pagar"
    )

  if not debt.amount or debt.amount <= 0:
    # A meter that was never read owes nothing: it is annulled, not paid
    raise HTTPException(
      status_code=400,
      detail="La deuda no tiene importe: corresponde anularla, no pagarla",
    )

  return debts_service.pay_debt(db, debt=debt, data=data)


@router.post("/{debt_id}/cancel", response_model=DebtItemDetail)
def cancel_debt(debt_id: int, db: Session = Depends(get_db)):
  """
  Annuls a debt. This is how the debt of a meter that was never read stops
  showing as owed while staying on the register for an audit.
  """
  debt = _get_debt_or_404(db, debt_id)

  if debt.status == DebtStatus.PAID:
    raise HTTPException(
      status_code=409, detail="La deuda ya fue pagada y no se puede anular"
    )

  return debts_service.cancel_debt(db, debt=debt)
