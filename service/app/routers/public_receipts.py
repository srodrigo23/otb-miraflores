from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

import app.services.debts as debts_service
import app.services.neighbor_meters as neighbor_meters
from ..schemas.public_receipt import PublicReceipt
from ..db.database import get_db

router = APIRouter(
  prefix="/receipts",
  tags=['Receipts'],
  responses={404: {"description": "Not found"}}
)


@router.get("/{reference}", response_model=PublicReceipt)
def read_public_receipt(reference: str, db: Session = Depends(get_db)):
  """
  What a scanned receipt QR resolves to.

  Deliberately public: whoever scans the paper is a neighbor holding their own
  receipt, not someone logged into the system. It is addressed by the opaque
  reference and never by the receipt number, which is correlative and would let
  anyone walk through every receipt by counting.
  """
  payment = debts_service.get_payment_by_reference(db, reference=reference)
  if payment is None:
    raise HTTPException(status_code=404, detail="Recibo no encontrado")

  debt = payment.debt_item
  reading = debt.meter_reading
  measure = reading.measure
  previous_reading = neighbor_meters.get_previous_reading(db, reading)

  years = debts_service.get_neighbor_statement(db, neighbor_id=payment.neighbor_id)

  return {
    "receipt_number": debts_service.format_receipt_number(payment.id),
    "reference": payment.reference,
    "paid_at": payment.paid_at,
    "amount": payment.amount,

    "period": measure.period or "",
    "year": measure.year or 0,
    "meter_code": reading.meter.meter_code,
    "consumption": debt.consumption or 0,
    "previous_reading": previous_reading,
    "current_reading": reading.current_reading or 0,

    "neighbor": {"full_name": payment.neighbor.full_name},

    "total_paid": sum(y["paid_amount"] for y in years),
    "total_pending": sum(y["pending_amount"] for y in years),
    "years": years,
  }
