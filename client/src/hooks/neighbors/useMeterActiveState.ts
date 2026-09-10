import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { MeterLedger } from '../../interfaces/neighborDebtsInterfaces';

/**
 * Enabled/disabled state of the meters of a neighbor.
 *
 * TODO: there is no endpoint to update a meter yet, so a change only lives in
 * a local overlay on top of what the API returned. Once it exists, call it in
 * `setMeterActive` and refetch the ledgers; the toasts, the error branch and
 * the saving flag are already where they need to be.
 */
export const useMeterActiveState = (meters: MeterLedger[]) => {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [isSavingActive, setIsSavingActive] = useState(false);

  // Whatever was flipped stops applying once the meters themselves change
  useEffect(() => setOverrides({}), [meters]);

  const isMeterActive = (meter: { id: number; is_active: boolean }) =>
    overrides[meter.id] ?? meter.is_active;

  const setMeterActive = async (meterId: number, isActive: boolean) => {
    const code = meters.find((item) => item.id === meterId)?.meter_code ?? '';
    setIsSavingActive(true);
    try {
      setOverrides((current) => ({ ...current, [meterId]: isActive }));
      toast.success(
        isActive
          ? `Medidor ${code} habilitado correctamente`
          : `Medidor ${code} deshabilitado correctamente`,
      );
    } catch {
      toast.error('No se pudo actualizar el estado del medidor');
    } finally {
      setIsSavingActive(false);
    }
  };

  return { isMeterActive, setMeterActive, isSavingActive };
};

export default useMeterActiveState;
