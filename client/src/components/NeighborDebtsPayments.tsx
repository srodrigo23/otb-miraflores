import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { useNeighborMeterLedgers } from '../hooks/neighbors/useNeighborMeterLedgers';
import { useNewMeter } from '../hooks/neighbors/useNewMeter';
import { useMeterActiveState } from '../hooks/neighbors/useMeterActiveState';
import type { ReceiptNeighbor } from '../reports/PaymentReceipt';
import { InputsNewMeterForm } from '../types/NeighborsTypes';
import { LoaderAnimation } from './shared/LoaderAnimation';
import { EmptyState } from './shared/EmptyState';
import AddMeterButton from './neighbors/debts/AddMeterButton';
import MeterSelectorTabs from './neighbors/debts/MeterSelectorTabs';
import { MeterConsumptionPanel } from './neighbors/debts/MeterConsumptionPanel';
import { MeterLedgerPanel } from './neighbors/debts/MeterLedgerPanel';

/**
 * Meters of a neighbor: pick one and see its consumption, debts and payments.
 *
 * This component only loads the data and lays the pieces out. The picker lives
 * in MeterSelectorTabs, the chart in MeterConsumptionPanel and the debts and
 * payments in MeterLedgerPanel.
 */
export const NeighborDebtsPayments: React.FC<{
  neighborId: number | undefined;
  /** Only what the printed receipt needs to identify the payer */
  neighbor: ReceiptNeighbor;
}> = ({ neighborId, neighbor }) => {
  const {
    data: meters = [],
    isLoading,
    error,
    refetchMeterLedgers,
  } = useNeighborMeterLedgers(neighborId);
  const { createNewMeter } = useNewMeter(neighborId);
  const { isMeterActive, setMeterActive, isSavingActive } =
    useMeterActiveState(meters);

  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);

  // Select the first meter once they arrive, and again if the neighbor changes
  useEffect(() => {
    setSelectedMeterId(meters.length > 0 ? meters[0].id : null);
  }, [meters]);

  const handleCreateMeter = async (data: InputsNewMeterForm) => {
    const created = await createNewMeter(data);
    if (created) await refetchMeterLedgers();
    return created;
  };

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <LoaderAnimation fullScreen={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center text-blue-gray-500'>
        <ExclamationTriangleIcon className='h-10 w-10 text-red-400' />
        <p className='text-sm'>No se pudieron cargar los medidores del vecino.</p>
      </div>
    );
  }

  // The add button belongs here too: a neighbor with no meters is exactly who
  // needs one, and the tab bar that normally carries it is not rendered.
  if (meters.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center gap-3 rounded-lg border border-blue-gray-100 bg-white'>
        <EmptyState message='Este vecino no tiene medidores registrados.' />
        <AddMeterButton onCreateMeter={handleCreateMeter} />
      </div>
    );
  }

  const meter = meters.find((item) => item.id === selectedMeterId) ?? meters[0];

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-2'>
      <MeterSelectorTabs
        meters={meters}
        selectedMeter={meter}
        onSelectMeter={setSelectedMeterId}
        isMeterActive={isMeterActive}
        onSetMeterActive={setMeterActive}
        isSavingActive={isSavingActive}
        onCreateMeter={handleCreateMeter}
      />

      {/* Keyed on the meter so switching resets the chart instead of animating
          from the previous meter's readings */}
      <div
        key={meter.id}
        className='grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]'
      >
        <MeterConsumptionPanel meter={meter} />
        <MeterLedgerPanel meter={meter} neighbor={neighbor} />
      </div>
    </section>
  );
};
