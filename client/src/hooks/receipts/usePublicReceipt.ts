import { useEffect } from 'react';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';
import { PublicReceiptType } from '../../interfaces/receiptsInterfaces';

/**
 * The receipt a scanned QR points at, with the neighbor's standing.
 *
 * No credentials: whoever scans the paper is a neighbor holding their own
 * receipt, not someone logged into the system.
 */
export const usePublicReceipt = (reference: string | undefined) => {
  const { data, isLoading, error, execute } =
    useFetchData<PublicReceiptType>();

  useEffect(() => {
    if (!reference) return;
    execute(`${apiLink}/receipts/${reference}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [reference]);

  return { receipt: data, isLoading, error };
};

export default usePublicReceipt;
