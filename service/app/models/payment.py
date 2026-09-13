from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from app.db.database import Base


class Payment(Base):
  """
  A debt being settled. One payment per debt and one debt per payment: there
  are no partial payments, so a debt is either owed in full or paid in full.
  """
  __tablename__ = "payments"

  id = Column(Integer, primary_key=True, index=True)

  # unique is what makes the relation 1:1 — a debt cannot be paid twice
  debt_item_id = Column(
    Integer, ForeignKey("debt_items.id"), unique=True, nullable=False
  )
  # Reachable through the debt, kept here so a neighbor's payments can be
  # listed without walking every debt. Always set from the debt, never from
  # the request, so the two cannot disagree
  neighbor_id = Column(Integer, ForeignKey("neighbors.id"), nullable=False)

  # Date and time the payment was taken, in one column. Nullable because the
  # seeded history carries neither: those debts were settled on paper before
  # the system existed
  paid_at = Column(DateTime, nullable=True)
  # Mirrors debt.amount at the time it was settled, in cents
  amount = Column(Integer, nullable=False)

  # There is no receipt number column: the receipt number IS this row's id, so
  # it is correlative by construction and cannot be typed in wrong or repeated.
  #
  # The reference is the other half: an opaque id for the QR printed on the
  # receipt, so whoever scans it cannot guess another neighbor's receipt by
  # counting, which the correlative would let them do
  reference = Column(
    String(36), unique=True, nullable=False, default=lambda: str(uuid4())
  )

  received_by = Column(String(100))  # Persona que recibio el pago

  created_at = Column(DateTime, default=datetime.utcnow)

  # Relaciones
  neighbor = relationship("Neighbor")
  debt_item = relationship("DebtItem", back_populates="payment")
