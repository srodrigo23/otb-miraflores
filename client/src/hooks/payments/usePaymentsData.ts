import { useMemo, useState } from 'react';

import {
  EMPTY_PAYMENT_FILTERS,
  PaymentFilters,
  PaymentRecord,
} from '../../interfaces/paymentsInterfaces';
import { MOCK_PAYMENTS } from '../../mocks/paymentsMock';
import { toIsoDate } from '../../utils/dates';

const matchesFilters = (payment: PaymentRecord, filters: PaymentFilters) => {
  const paidOn = toIsoDate(payment.paid_at);

  // Both ends are inclusive, and an empty end means unbounded
  if (filters.from && paidOn < filters.from) return false;
  if (filters.to && paidOn > filters.to) return false;
  if (filters.collector && payment.collector_name !== filters.collector) {
    return false;
  }

  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    const haystack =
      `${payment.meter_code} ${payment.neighbor_name} ${payment.receipt}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  return true;
};

/**
 * Payments plus the filter state the whole module reads from.
 *
 * Filtering happens in memory over the mock. Once the endpoint exists the
 * filters travel as query params and only this hook changes.
 */
export const usePaymentsData = () => {
  const [filters, setFilters] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS);

  const allPayments = MOCK_PAYMENTS;

  const payments = useMemo(
    () => allPayments.filter((payment) => matchesFilters(payment, filters)),
    [allPayments, filters],
  );

  const collectors = useMemo(
    () =>
      Array.from(
        new Set(allPayments.map((payment) => payment.collector_name)),
      ).sort(),
    [allPayments],
  );

  const updateFilters = (patch: Partial<PaymentFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const resetFilters = () => setFilters(EMPTY_PAYMENT_FILTERS);

  const hasActiveFilters =
    filters.from !== '' ||
    filters.to !== '' ||
    filters.collector !== '' ||
    filters.search !== '';

  return {
    payments,
    totalCount: allPayments.length,
    collectors,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    isLoading: false,
  };
};
