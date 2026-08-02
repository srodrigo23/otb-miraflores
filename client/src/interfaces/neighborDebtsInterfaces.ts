/**
 * Shapes for the debts and payments a neighbor holds per meter.
 * Currently fed by mocks (see src/mocks/), and meant to mirror what
 * /neighbors/{id}/debts and the payments endpoints will return.
 */

/** A debt is settled or it is not: there are no partial payments */
export type DebtStatus = 'PENDING' | 'PAID';

export interface ConsumptionPoint {
  /** Short period label, e.g. "MAR-ABR" */
  period: string;
  year: number;
  consumption: number;
}

export interface LedgerDebt {
  id: number;
  period: string;
  year: number;
  previousReading: number;
  currentReading: number;
  consumption: number;
  /** What the reading is billed at. Owed in full while the status is PENDING */
  amount: number;
  status: DebtStatus;
}

export interface LedgerPayment {
  id: number;
  receipt: string;
  /** ISO date, e.g. "2026-05-12" */
  date: string;
  period: string;
  amount: number;
  method: string;
}

export interface MeterLedger {
  id: number;
  code: string;
  section: string;
  /** Consumption history, oldest first, so the line reads left to right */
  history: ConsumptionPoint[];
  debts: LedgerDebt[];
  payments: LedgerPayment[];
}
