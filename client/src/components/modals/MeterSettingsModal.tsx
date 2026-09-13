import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Switch,
  Typography,
} from '@material-tailwind/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

import { MeterLedger } from '../../interfaces/neighborDebtsInterfaces';
import { NUMERIC } from '../../utils/format';

/** One read-only fact about the meter */
const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className='rounded-lg border border-blue-gray-100 px-3 py-2'>
    <Typography variant='small' color='blue-gray' className='font-normal'>
      {label}
    </Typography>
    <div className='text-base font-bold text-blue-gray-900'>{children}</div>
  </div>
);

type MeterSettingsModalProps = {
  openModalState: boolean;
  handleCloseModal: () => void;
  meter: MeterLedger;
  isActive: boolean;
  /** Only action of this modal; deactivating is confirmed by the caller */
  onToggleActive: (isActive: boolean) => void;
  isSaving?: boolean;
};

/**
 * Meter settings: what it is, and the one thing about it that can change.
 *
 * The code, the section and the initial reading are shown read-only — readings
 * and debts already hang off them, so they are fixed once registered.
 */
const MeterSettingsModal: React.FC<MeterSettingsModalProps> = ({
  openModalState,
  handleCloseModal,
  meter,
  isActive,
  onToggleActive,
  isSaving = false,
}) => {
  return (
    <Dialog open={openModalState} handler={handleCloseModal} size='sm'>
      <DialogHeader className='flex items-start gap-3 pb-2'>
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-gray-50 text-blue-gray-700'>
          <Cog6ToothIcon className='h-6 w-6' />
        </span>
        <div className='flex flex-col gap-0.5'>
          <Typography variant='h4' color='black'>
            Medidor {meter.meter_code}
          </Typography>
          <Typography variant='small' color='blue-gray' className='font-normal'>
            Sección {meter.section}
          </Typography>
        </div>
      </DialogHeader>

      <DialogBody className='flex flex-col gap-4 pt-0'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Fact label='Código'>
            <span className={NUMERIC}>{meter.meter_code}</span>
          </Fact>
          <Fact label='Sección'>{meter.section}</Fact>
          <Fact label='Lectura inicial'>
            <span className={NUMERIC}>{meter.initial_reading} m³</span>
          </Fact>
          <Fact label='Lecturas registradas'>
            <span className={NUMERIC}>{meter.history.length}</span>
          </Fact>
        </div>

        <div className='flex items-center justify-between rounded-lg border border-blue-gray-100 px-3 py-2'>
          <div>
            <Typography
              variant='small'
              color='blue-gray'
              className='font-semibold'
            >
              Estado del medidor
            </Typography>
            <Typography variant='small' color='gray' className='font-normal'>
              {isActive
                ? 'Habilitado: entra en las mediciones'
                : 'Deshabilitado: queda fuera de las mediciones'}
            </Typography>
          </div>
          <Switch
            crossOrigin={undefined}
            color='green'
            checked={isActive}
            onChange={(e) => onToggleActive(e.target.checked)}
            disabled={isSaving}
            aria-label={`Habilitar medidor ${meter.meter_code}`}
          />
        </div>

        <Typography variant='small' color='gray' className='font-normal'>
          El código, la sección y la lectura inicial no se pueden modificar: las
          lecturas y deudas registradas dependen de ellos.
        </Typography>
      </DialogBody>

      <DialogFooter>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={handleCloseModal}
          disabled={isSaving}
        >
          <span>Cerrar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default MeterSettingsModal;
