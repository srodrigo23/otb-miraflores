/**
 * Payments collected from neighbors.
 *
 * Fed by mocks for now: the Payment model is still parked in
 * service/app/models/unused_models/, so there is no endpoint to read from yet.
 * Field names are snake_case so the swap to the API is a change of source only.
 */

export interface PaymentRecord {
  id: number;
  /** Number written on the paper receipt */
  receipt: string;
  meter_code: string;
  neighbor_name: string;
  /** Who collected it */
  collector_name: string;
  /** In cents, like every amount in the API */
  amount: number;
  /** ISO datetime: the table splits it into date and time columns */
  paid_at: string;
  notes: string | null;
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
