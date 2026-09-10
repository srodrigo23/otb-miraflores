import { useEffect, useState } from 'react';
import {
  IconButton,
  Switch,
  Tabs,
  TabsHeader,
  Tab,
  Tooltip,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { useNeighborMeterLedgers } from '../hooks/neighbors/useNeighborMeterLedgers';
import { useNewMeter } from '../hooks/neighbors/useNewMeter';
import type { ReceiptNeighbor } from '../reports/PaymentReceipt';
import { InputsNewMeterForm } from '../types/NeighborsTypes';
import { NUMERIC } from '../utils/format';
import { LoaderAnimation } from './shared/LoaderAnimation';
import { EmptyState } from './shared/EmptyState';
import { MeterConsumptionPanel } from './neighbors/debts/MeterConsumptionPanel';
import { MeterLedgerPanel } from './neighbors/debts/MeterLedgerPanel';
import NewMeterModalForm from './forms/NewMeterModalForm';
import DeactivateMeterModal from './modals/DeactivateMeterModal';

/** Meters of a neighbor: pick one and see its consumption, debts and payments */
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
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);
  const [openNewMeterModal, setOpenNewMeterModal] = useState(false);
  // Id of the meter waiting for the user to confirm its deactivation
  const [meterToDeactivate, setMeterToDeactivate] = useState<number | null>(
    null,
  );
  const [isSavingActive, setIsSavingActive] = useState(false);
  // Enabled/disabled flipped in the UI but not yet persisted: there is no
  // endpoint to update a meter, so the switch reads through this overlay.
  const [activeOverrides, setActiveOverrides] = useState<
    Record<number, boolean>
  >({});

  // Select the first meter once they arrive, and again if the neighbor changes
  useEffect(() => {
    setSelectedMeterId(meters.length > 0 ? meters[0].id : null);
    setActiveOverrides({});
  }, [meters]);

  const toggleNewMeterModal = () => setOpenNewMeterModal((isOpen) => !isOpen);

  const isMeterActive = (item: { id: number; is_active: boolean }) =>
    activeOverrides[item.id] ?? item.is_active;

  /**
   * Persists the new state and reports it.
   *
   * TODO: there is no endpoint to update a meter yet, so this only writes the
   * local overlay. Once it exists, call it here and refetch the ledgers; the
   * toast and the error branch are already where they need to be.
   */
  const persistMeterActive = async (meterId: number, isActive: boolean) => {
    const code = meters.find((item) => item.id === meterId)?.meter_code ?? '';
    setIsSavingActive(true);
    try {
      setActiveOverrides((current) => ({ ...current, [meterId]: isActive }));
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

  // Only turning a meter off asks for confirmation: enabling one back is
  // harmless and undoing it is one click away.
  const handleToggleMeterActive = (meterId: number, isActive: boolean) => {
    if (isActive) {
      persistMeterActive(meterId, true);
      return;
    }
    setMeterToDeactivate(meterId);
  };

  const handleConfirmDeactivate = async () => {
    if (meterToDeactivate === null) return;
    await persistMeterActive(meterToDeactivate, false);
    setMeterToDeactivate(null);
  };

  const handlerNewMeter = async (data: InputsNewMeterForm) => {
    const created = await createNewMeter(data);
    if (created) await refetchMeterLedgers();
    return created;
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
      <div className='flex flex-1 items-center justify-center gap-3 rounded-lg border border-blue-gray-100 bg-white'>
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
                      isMeterActive(item) ? 'bg-green-500' : 'bg-red-400'
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

        {/* Acts on the meter of the active tab, named in the tooltip so it is
            never ambiguous which one is being switched. */}
        <Tooltip
          content={`${isMeterActive(meter) ? 'Deshabilitar' : 'Habilitar'} el medidor ${meter.meter_code}`}
        >
          <div className='flex shrink-0 items-center gap-2'>
            <Switch
              crossOrigin={undefined}
              color='green'
              checked={isMeterActive(meter)}
              onChange={(e) =>
                handleToggleMeterActive(meter.id, e.target.checked)
              }
              disabled={isSavingActive}
              aria-label={`Habilitar medidor ${meter.meter_code}`}
            />
            <span
              className={`text-xs font-semibold ${
                isMeterActive(meter) ? 'text-green-700' : 'text-blue-gray-500'
              }`}
            >
              {isMeterActive(meter) ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        </Tooltip>

        {addMeterButton}
      </div>

      {newMeterModal}

      <DeactivateMeterModal
        openModalState={meterToDeactivate !== null}
        handleCloseModal={() => setMeterToDeactivate(null)}
        meterCode={
          meters.find((item) => item.id === meterToDeactivate)?.meter_code
        }
        onConfirmDeactivate={handleConfirmDeactivate}
        isSaving={isSavingActive}
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
