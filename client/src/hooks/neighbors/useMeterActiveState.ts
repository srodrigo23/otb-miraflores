import { useEffect, useState } from 'react';

import { MeterLedger } from '../../interfaces/neighborDebtsInterfaces';
import { useUpdateMeter } from './useUpdateMeter';

/**
 * Enabled/disabled state of the meters of a neighbor.
 *
 * The change is persisted through PATCH /meters/{id} and mirrored in a local
 * overlay, so the tabs and the settings modal follow immediately instead of
 * waiting for the ledgers to be read again.
 */
export const useMeterActiveState = (
  meters: MeterLedger[],
  /** Re-reads the ledgers once the change is stored */
  refetchMeterLedgers?: () => Promise<unknown>,
) => {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const { setMeterActive: persist, isSaving: isSavingActive } =
    useUpdateMeter();

  // The overlay stops applying once the meters themselves are read again
  useEffect(() => setOverrides({}), [meters]);

  const isMeterActive = (meter: { id: number; is_active: boolean }) =>
    overrides[meter.id] ?? meter.is_active;

  const setMeterActive = async (meterId: number, isActive: boolean) => {
    const saved = await persist(meterId, isActive);
    // Only mirror what the API accepted: a failed call must leave the switch
    // showing the state the meter really has.
    if (!saved) return;
    setOverrides((current) => ({ ...current, [meterId]: isActive }));
    await refetchMeterLedgers?.();
  };

  return { isMeterActive, setMeterActive, isSavingActive };
};

export default useMeterActiveState;
