import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';

import { LedgerDebt } from '../../interfaces/neighborDebtsInterfaces';
import { currency, NUMERIC } from '../../utils/format';

/** One line of the summary the collector checks before committing */
const Line: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className='flex items-baseline justify-between gap-3 py-1'>
    <span className='text-sm text-blue-gray-600'>{label}</span>
    <span className='text-sm font-semibold text-blue-gray-900'>{children}</span>
  </div>
);

type ConfirmPaymentModalProps = {
  openModalState: boolean;
  handleCloseModal: () => void;
  debt: LedgerDebt;
  meterCode: string;
  onConfirmPayment: () => void;
  isSaving?: boolean;
};

/**
 * Last stop before the debt is settled. Registering a payment cannot be undone
 * from the app, so what is about to be stored is restated here in full.
 */
const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  openModalState,
  handleCloseModal,
  debt,
  meterCode,
  onConfirmPayment,
  isSaving = false,
}) => {
  return (
    <Dialog
      open={openModalState}
      handler={handleCloseModal}
      size='sm'
      dismiss={{ escapeKey: !isSaving, outsidePress: false }}
    >
      <DialogBody className='flex flex-col gap-4'>
        <div className='text-center'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100'>
            <ExclamationTriangleIcon
              className='h-8 w-8 text-amber-600'
              strokeWidth={2}
            />
          </div>
          <Typography variant='h4' color='blue-gray' className='mb-1'>
            ¿Confirmar el pago?
          </Typography>
          <Typography color='gray' className='font-normal'>
            La deuda quedará saldada y no se podrá deshacer desde el sistema.
          </Typography>
        </div>

        <div className='divide-y divide-blue-gray-50 rounded-lg border border-blue-gray-100 px-3 py-1'>
          <Line label='Medidor'>
            <span className={NUMERIC}>{meterCode}</span>
          </Line>
          <Line label='Periodo'>
            {debt.period} {debt.year}
          </Line>
          <Line label='Consumo'>
            <span className={NUMERIC}>{debt.consumption} m³</span>
          </Line>
          <Line label='Forma de pago'>Efectivo</Line>
          <div className='flex items-baseline justify-between gap-3 py-2'>
            <span className='text-sm font-medium text-blue-gray-600'>
              Monto a cobrar
            </span>
            <span className={`text-2xl font-bold text-green-700 ${NUMERIC}`}>
              {currency(debt.amount)}
            </span>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className='justify-center gap-2'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={handleCloseModal}
          disabled={isSaving}
        >
          <span>Volver</span>
        </Button>
        <Button
          variant='gradient'
          color='green'
          onClick={onConfirmPayment}
          disabled={isSaving}
          className='flex items-center justify-center gap-2'
        >
          {isSaving && <ClipLoader size={16} color='white' />}
          <span>{isSaving ? 'Registrando...' : 'Confirmar pago'}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmPaymentModal;
