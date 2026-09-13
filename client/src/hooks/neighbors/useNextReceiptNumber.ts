import { useEffect } from 'react';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';

type NextReceiptNumberResponse = { receipt_number: string };

/**
 * What the next payment's receipt will read.
 *
 * It is a preview for the form: the number that ends up printed is the id the
 * database assigns, which comes back in the payment itself.
 */
export const useNextReceiptNumber = (enabled: boolean) => {
  const { data, isLoading, error, execute } =
    useFetchData<NextReceiptNumberResponse>();

  // Refetched every time the form opens: another collector may have taken a
  // payment in the meantime, which moves the correlative forward
  useEffect(() => {
    if (!enabled) return;
    execute(`${apiLink}/debts/next-receipt-number`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [enabled]);

  return { receiptNumber: data?.receipt_number ?? '', isLoading, error };
};

export default useNextReceiptNumber;
