import { toast } from 'react-toastify';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';
import { InputsNewMeterForm } from '../../types/NeighborsTypes';

type CreatedMeter = { id: number; meter_code: string; section: string };
/** Detail the API sends back on a rejected create, e.g. a taken code */
type ApiError = { detail?: string };

export const useNewMeter = (neighborId: number | undefined) => {
  const { data, isLoading, error, execute } = useFetchData<CreatedMeter>();

  /** Resolves to whether the meter was created, so the form can stay open on failure */
  const createNewMeter = async (payload: InputsNewMeterForm) => {
    if (neighborId === undefined) {
      toast.error('No se pudo identificar al vecino');
      return false;
    }

    const result = await execute(`${apiLink}/neighbors/${neighborId}/meters`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result?.ok) {
      const created = result.data as CreatedMeter;
      toast.success(`Medidor ${created.meter_code} creado exitosamente`);
      return true;
    }

    // The router explains a taken code or a mismatched section; anything else
    // falls back to a generic message.
    const detail = (result?.data as ApiError | null)?.detail;
    toast.error(
      typeof detail === 'string' ? detail : 'No se pudo crear el medidor',
    );
    return false;
  };

  return { createNewMeter, isLoading, data, error };
};

export default useNewMeter;
