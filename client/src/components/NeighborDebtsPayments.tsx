import { useEffect, useState } from 'react';
import { IconButton, Tabs, TabsHeader, Tab, Tooltip } from '@material-tailwind/react';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';

import { useNeighborMeterLedgers } from '../hooks/neighbors/useNeighborMeterLedgers';
import type { ReceiptNeighbor } from '../reports/PaymentReceipt';
import { InputsNewMeterForm } from '../types/NeighborsTypes';
import { NUMERIC } from '../utils/format';
import { LoaderAnimation } from './shared/LoaderAnimation';
import { EmptyState } from './shared/EmptyState';
import { MeterConsumptionPanel } from './neighbors/debts/MeterConsumptionPanel';
import { MeterLedgerPanel } from './neighbors/debts/MeterLedgerPanel';
import NewMeterModalForm from './forms/NewMeterModalForm';

/** Meters of a neighbor: pick one and see its consumption, debts and payments */
export const NeighborDebtsPayments: React.FC<{
  neighborId: number | undefined;
  /** Only what the printed receipt needs to identify the payer */
  neighbor: ReceiptNeighbor;
}> = ({ neighborId, neighbor }) => {
  const { data: meters = [], isLoading, error } = useNeighborMeterLedgers(neighborId);
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);
  const [openNewMeterModal, setOpenNewMeterModal] = useState(false);

  // Select the first meter once they arrive, and again if the neighbor changes
  useEffect(() => {
    setSelectedMeterId(meters.length > 0 ? meters[0].id : null);
  }, [meters]);

  const toggleNewMeterModal = () => setOpenNewMeterModal((isOpen) => !isOpen);

  // Visual only for now: the endpoint that registers a meter is still to be
  // designed, so nothing is persisted and the list is not refetched.
  const handlerNewMeter = async (data: InputsNewMeterForm) => {
    void data;
  };

  const addMeterButton = (
    <Tooltip content='Agregar medidor'>
      <IconButton
        variant='gradient'
        color='blue'
        size='md'
        onClick={toggleNewMeterModal}
        aria-label='Agregar medidor'
        className='shrink-0'
      >
        <PlusIcon className='h-5 w-5' />
      </IconButton>
    </Tooltip>
  );

  const newMeterModal = (
    <NewMeterModalForm
      openModalState={openNewMeterModal}
      handleCloseModal={toggleNewMeterModal}
      onSubmit={handlerNewMeter}
    />
  );

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

  // The button belongs here too: a neighbor with no meters is exactly who needs
  // to get one, and the tab bar that normally carries it is not rendered.
  if (meters.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-blue-gray-100 bg-white'>
        <EmptyState message='Este vecino no tiene medidores registrados.' />
        {addMeterButton}
        {newMeterModal}
      </div>
    );
  }

  const meter = meters.find((item) => item.id === selectedMeterId) ?? meters[0];

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-2'>
      {/* Tabs act only as the meter selector: no TabsBody, so the panels below
          render the selected meter alone instead of mounting one chart per
          meter. Keyed on the meter set so a neighbor with different meters
          never leaves the tabs pointing at an id that is gone. */}
      <div className='flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
        <span className='shrink-0 text-xs font-semibold uppercase tracking-wide text-blue-gray-500'>
          Medidores
        </span>
        <Tabs
          key={meters.map((item) => item.id).join('-')}
          value={String(meter.id)}
          className='min-w-0 flex-1'
        >
          <TabsHeader>
            {meters.map((item) => (
              <Tab
                key={item.id}
                value={String(item.id)}
                onClick={() => setSelectedMeterId(item.id)}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      item.is_active ? 'bg-green-500' : 'bg-red-400'
                    }`}
                    aria-hidden='true'
                  />
                  <span className={`text-sm font-semibold ${NUMERIC}`}>
                    {item.meter_code}
                  </span>
                  <span className='hidden text-xs text-blue-gray-500 sm:inline'>
                    Sección {item.section}
                  </span>
                </div>
              </Tab>
            ))}
          </TabsHeader>
        </Tabs>
        {addMeterButton}
      </div>

      {newMeterModal}

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
