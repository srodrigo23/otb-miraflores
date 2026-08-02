/**
 * Shapes returned by GET /neighbors/{id}/meters: each meter of a neighbor with
 * its consumption history and its debts. Field names are snake_case to match
 * the API, like the rest of the interfaces in this folder.
 */

/** A debt is settled or it is not: there are no partial payments */
export type DebtStatus = 'PENDING' | 'PAID';

export interface ConsumptionPoint {
  /** Period label as the measure names it, e.g. "MARZO-ABRIL" */
  period: string;
  year: number;
  consumption: number;
}

export interface LedgerDebt {
  id: number;
  period: string;
  year: number;
  previous_reading: number;
  current_reading: number;
  consumption: number;
  /** In cents, as everything money-related in the API */
  amount: number;
  status: DebtStatus;
}

export interface LedgerPayment {
  id: number;
  receipt: string;
  /** ISO date, e.g. "2026-05-12" */
  date: string;
  period: string;
  /** In cents */
  amount: number;
  method: string;
}

export interface MeterLedger {
  id: number;
  meter_code: string;
  section: string;
  initial_reading: number;
  is_active: boolean;
  /** Consumption history, oldest first, so the line reads left to right */
  history: ConsumptionPoint[];
  debts: LedgerDebt[];
  payments: LedgerPayment[];
}
