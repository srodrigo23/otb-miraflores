import { useEffect } from 'react';

import useFetchData from '../useFetchData';
import { MeterLedger } from '../../interfaces/neighborDebtsInterfaces';
import { apiLink } from '../../config';

/**
 * Meters of a neighbor with their consumption history and debts.
 * One request answers the whole panel: plates, chart and ledger.
 */
export const useNeighborMeterLedgers = (neighborId: number | undefined) => {
  const { data, isLoading, error, execute } = useFetchData<MeterLedger[]>();

  const apiNeighborMeters = `${apiLink}/neighbors/${neighborId}/meters`;

  useEffect(() => {
    if (neighborId === undefined) return;
    execute(apiNeighborMeters, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [neighborId]);

  const refetchMeterLedgers = async () => {
    if (neighborId === undefined) return;
    await execute(apiNeighborMeters, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return { data, isLoading, error, refetchMeterLedgers };
};
