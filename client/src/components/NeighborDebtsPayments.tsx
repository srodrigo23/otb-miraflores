import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { useNeighborMeterLedgers } from '../hooks/neighbors/useNeighborMeterLedgers';
import { LoaderAnimation } from './shared/LoaderAnimation';
import { EmptyState } from './shared/EmptyState';
import { MeterPlate } from './neighbors/debts/MeterPlate';
import { MeterConsumptionPanel } from './neighbors/debts/MeterConsumptionPanel';
import { MeterLedgerPanel } from './neighbors/debts/MeterLedgerPanel';

/** Meters of a neighbor: pick one and see its consumption, debts and payments */
export const NeighborDebtsPayments: React.FC<{
  neighborId: number | undefined;
}> = ({ neighborId }) => {
  const { data: meters = [], isLoading, error } = useNeighborMeterLedgers(neighborId);
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);

  // Select the first meter once they arrive, and again if the neighbor changes
  useEffect(() => {
    setSelectedMeterId(meters.length > 0 ? meters[0].id : null);
  }, [meters]);

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

  if (meters.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center rounded-lg border border-blue-gray-100 bg-white'>
        <EmptyState message='Este vecino no tiene medidores registrados.' />
      </div>
    );
  }

  const meter = meters.find((item) => item.id === selectedMeterId) ?? meters[0];

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-1'>
      <div className='flex items-center gap-2 overflow-x-auto pb-1'>
        {meters.map((item) => (
          <MeterPlate
            key={item.id}
            meter={item}
            isSelected={item.id === meter.id}
            onSelect={() => setSelectedMeterId(item.id)}
          />
        ))}
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]'>
        <MeterConsumptionPanel meter={meter} />
        <MeterLedgerPanel meter={meter} />
      </div>
    </section>
  );
};
