/**
 * Shapes returned by GET /receipts/{reference}: the public view of a receipt,
 * reached by scanning the QR printed on it.
 */

export type PublicDebtStatus = 'PENDING' | 'PAID';

export interface PublicReceiptDebt {
  id: number;
  period: string;
  year: number;
  meter_code: string;
  consumption: number;
  /** In cents, as everything money-related in the API */
  amount: number;
  status: PublicDebtStatus;
  /** Only once it was settled */
  receipt_number: string | null;
  paid_at: string | null;
}

/** A "gestión": everything of one year */
export interface PublicReceiptYear {
  year: number;
  paid_amount: number;
  pending_amount: number;
  paid_count: number;
  pending_count: number;
  debts: PublicReceiptDebt[];
}

export interface PublicReceiptType {
  receipt_number: string;
  reference: string;
  paid_at: string | null;
  amount: number;

  /** What this particular receipt paid for */
  period: string;
  year: number;
  meter_code: string;
  consumption: number;
  previous_reading: number;
  current_reading: number;

  neighbor: { full_name: string };

  total_paid: number;
  total_pending: number;
  years: PublicReceiptYear[];
}
