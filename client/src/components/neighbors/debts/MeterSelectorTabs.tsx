import { useState } from 'react';
import {
  IconButton,
  Tab,
  Tabs,
  TabsHeader,
  Tooltip,
} from '@material-tailwind/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

import { MeterLedger } from '../../../interfaces/neighborDebtsInterfaces';
import { InputsNewMeterForm } from '../../../types/NeighborsTypes';
import { NUMERIC } from '../../../utils/format';
import DeactivateMeterModal from '../../modals/DeactivateMeterModal';
import MeterSettingsModal from '../../modals/MeterSettingsModal';
import AddMeterButton from './AddMeterButton';

type MeterSelectorTabsProps = {
  meters: MeterLedger[];
  /** The meter the panels below are showing */
  selectedMeter: MeterLedger;
  onSelectMeter: (meterId: number) => void;
  isMeterActive: (meter: { id: number; is_active: boolean }) => boolean;
  /** Persists the new state; deactivating is confirmed here first */
  onSetMeterActive: (meterId: number, isActive: boolean) => Promise<void>;
  isSavingActive?: boolean;
  onCreateMeter: (data: InputsNewMeterForm) => Promise<boolean>;
};

/**
 * Meter picker: one tab per meter, plus the actions that belong to the meter
 * as a whole — enabling it and registering a new one.
 *
 * There is no TabsBody on purpose: the panels live outside, so only the
 * selected meter renders instead of mounting one chart per meter.
 */
export const MeterSelectorTabs: React.FC<MeterSelectorTabsProps> = ({
  meters,
  selectedMeter,
  onSelectMeter,
  isMeterActive,
  onSetMeterActive,
  isSavingActive = false,
  onCreateMeter,
}) => {
  const [openSettings, setOpenSettings] = useState(false);
  // Id of the meter waiting for the user to confirm its deactivation
  const [meterToDeactivate, setMeterToDeactivate] = useState<number | null>(
    null,
  );

  const isSelectedActive = isMeterActive(selectedMeter);

  // Only turning a meter off asks for confirmation: enabling one back is
  // harmless and undoing it is one click away. The settings modal steps aside
  // while the confirmation is up, rather than stacking one dialog on another.
  const handleToggle = (isActive: boolean) => {
    if (isActive) {
      onSetMeterActive(selectedMeter.id, true);
      return;
    }
    setOpenSettings(false);
    setMeterToDeactivate(selectedMeter.id);
  };

  const handleConfirmDeactivate = async () => {
    if (meterToDeactivate === null) return;
    await onSetMeterActive(meterToDeactivate, false);
    setMeterToDeactivate(null);
  };

  return (
    <div className='flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
      <span className='shrink-0 text-xs font-semibold uppercase tracking-wide text-blue-gray-500'>
        Medidores
      </span>

      {/* Keyed on the meter set so a neighbor with different meters never
          leaves the tabs pointing at an id that is gone. */}
      <Tabs
        key={meters.map((item) => item.id).join('-')}
        value={String(selectedMeter.id)}
        className='min-w-0 flex-1'
      >
        <TabsHeader>
          {meters.map((item) => (
            <Tab
              key={item.id}
              value={String(item.id)}
              onClick={() => onSelectMeter(item.id)}
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

      {/* Opens the settings of the meter of the active tab, named in the
          tooltip so it is never ambiguous which one it acts on. */}
      <Tooltip content={`Configurar el medidor ${selectedMeter.meter_code}`}>
        <IconButton
          variant='outlined'
          color='blue-gray'
          size='md'
          onClick={() => setOpenSettings(true)}
          aria-label={`Configurar medidor ${selectedMeter.meter_code}`}
          className='shrink-0'
        >
          <Cog6ToothIcon className='h-5 w-5' />
        </IconButton>
      </Tooltip>

      <AddMeterButton onCreateMeter={onCreateMeter} />

      <MeterSettingsModal
        openModalState={openSettings}
        handleCloseModal={() => setOpenSettings(false)}
        meter={selectedMeter}
        isActive={isSelectedActive}
        onToggleActive={handleToggle}
        isSaving={isSavingActive}
      />

      <DeactivateMeterModal
        openModalState={meterToDeactivate !== null}
        handleCloseModal={() => setMeterToDeactivate(null)}
        meterCode={
          meters.find((item) => item.id === meterToDeactivate)?.meter_code
        }
        onConfirmDeactivate={handleConfirmDeactivate}
        isSaving={isSavingActive}
      />
    </div>
  );
};

export default MeterSelectorTabs;
