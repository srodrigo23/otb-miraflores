import { useEffect, useMemo, useState } from 'react';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';
import {
  EMPTY_PAYMENT_FILTERS,
  PaymentFilters,
  PaymentRecord,
} from '../../interfaces/paymentsInterfaces';
import { toIsoDate } from '../../utils/dates';

const matchesFilters = (payment: PaymentRecord, filters: PaymentFilters) => {
  // A payment with no date is the seeded history: no date range can claim it
  if (filters.from || filters.to) {
    if (!payment.paid_at) return false;
    const paidOn = toIsoDate(payment.paid_at);
    // Both ends are inclusive, and an empty end means unbounded
    if (filters.from && paidOn < filters.from) return false;
    if (filters.to && paidOn > filters.to) return false;
  }

  if (filters.collector && payment.collector_name !== filters.collector) {
    return false;
  }

  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    const haystack =
      `${payment.meter_code} ${payment.neighbor_name} ${payment.receipt} ${payment.period}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  return true;
};

/**
 * Payments plus the filter state the whole module reads from.
 *
 * The list travels once and the filters run in memory: filtering server-side
 * would be a request per keystroke for a register of this size.
 */
export const usePaymentsData = () => {
  const [filters, setFilters] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS);
  const { data, isLoading, error, execute } = useFetchData<PaymentRecord[]>();

  useEffect(() => {
    execute(`${apiLink}/payments`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  const allPayments = useMemo(() => data ?? [], [data]);

  const payments = useMemo(
    () => allPayments.filter((payment) => matchesFilters(payment, filters)),
    [allPayments, filters],
  );

  const collectors = useMemo(
    () =>
      Array.from(
        new Set(
          allPayments
            .map((payment) => payment.collector_name)
            .filter((name): name is string => !!name),
        ),
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
    isLoading,
    error,
  };
};
