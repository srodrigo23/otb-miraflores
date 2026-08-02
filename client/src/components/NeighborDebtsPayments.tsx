import { useState } from 'react';

import { MOCK_METER_LEDGERS } from '../mocks/neighborDebtsMock';
import { MeterPlate } from './neighbors/debts/MeterPlate';
import { MeterConsumptionPanel } from './neighbors/debts/MeterConsumptionPanel';
import { MeterLedgerPanel } from './neighbors/debts/MeterLedgerPanel';

/**
 * Meters of a neighbor: pick one and see its consumption, debts and payments.
 * Fed by mocks until the endpoints are wired up.
 */
export const NeighborDebtsPayments = () => {
  const meters = MOCK_METER_LEDGERS;
  const [selectedMeterId, setSelectedMeterId] = useState(meters[0].id);
  const meter = meters.find((item) => item.id === selectedMeterId) ?? meters[0];

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-3'>
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
