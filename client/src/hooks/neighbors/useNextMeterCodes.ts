import { useEffect } from 'react';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';

type NextMeterCodesResponse = { codes: Record<string, string> };

/**
 * The next free meter code of every section, fetched in one request.
 *
 * The form reads the map for whichever section the user picks, so changing
 * section does not hit the API again.
 */
export const useNextMeterCodes = (enabled: boolean) => {
  const { data, isLoading, error, execute } =
    useFetchData<NextMeterCodesResponse>();

  const apiNextMeterCodes = `${apiLink}/meters/next-codes`;

  // Refetched every time the form opens: another collector may have registered
  // a meter in the meantime, which moves the correlative forward.
  useEffect(() => {
    if (!enabled) return;
    execute(apiNextMeterCodes, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [enabled]);

  return { codes: data?.codes ?? {}, isLoading, error };
};

export default useNextMeterCodes;
