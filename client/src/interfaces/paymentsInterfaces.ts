/**
 * Payments collected from neighbors, as GET /payments returns them.
 */

export interface PaymentRecord {
  id: number;
  /** The payment's own id, zero padded by the API */
  receipt: string;
  meter_code: string;
  neighbor_name: string;
  /** What period the settled debt belonged to */
  period: string;
  year: number;
  /** Who collected it. Null for the seeded history, taken on paper */
  collector_name: string | null;
  /** In cents, like every amount in the API */
  amount: number;
  /**
   * ISO datetime: the table splits it into date and time columns.
   * Null for the seeded history, whose sheets carry no date.
   */
  paid_at: string | null;
}

export interface PaymentFilters {
  /** ISO date, inclusive. Empty means unbounded */
  from: string;
  /** ISO date, inclusive */
  to: string;
  /** Empty means every collector */
  collector: string;
  /** Matches meter code or neighbor name */
  search: string;
}

export const EMPTY_PAYMENT_FILTERS: PaymentFilters = {
  from: '',
  to: '',
  collector: '',
  search: '',
};
