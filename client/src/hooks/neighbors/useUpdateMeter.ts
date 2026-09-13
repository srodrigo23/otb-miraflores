import { toast } from 'react-toastify';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';

type UpdatedMeter = { id: number; meter_code: string; is_active: boolean };
/** Detail the API sends back on a rejected update */
type ApiError = { detail?: string };

/** Changes what can be changed about an existing meter: its enabled flag */
export const useUpdateMeter = () => {
  // Runs on demand only, so it must not start out loading
  const {
    data,
    isLoading: isSaving,
    error,
    execute,
  } = useFetchData<UpdatedMeter>({ initialLoading: false });

  /** Resolves to whether it was saved, so the caller can keep its UI in step */
  const setMeterActive = async (meterId: number, isActive: boolean) => {
    const result = await execute(`${apiLink}/meters/${meterId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (result?.ok) {
      const updated = result.data as UpdatedMeter;
      toast.success(
        isActive
          ? `Medidor ${updated.meter_code} habilitado correctamente`
          : `Medidor ${updated.meter_code} deshabilitado correctamente`,
      );
      return true;
    }

    const detail = (result?.data as ApiError | null)?.detail;
    toast.error(
      typeof detail === 'string'
        ? detail
        : 'No se pudo actualizar el estado del medidor',
    );
    return false;
  };

  return { setMeterActive, isSaving, data, error };
};

export default useUpdateMeter;
