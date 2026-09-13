import { useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Typography,
} from '@material-tailwind/react';

import { LedgerDebt } from '../../../interfaces/neighborDebtsInterfaces';
import { useNextReceiptNumber } from '../../../hooks/neighbors/useNextReceiptNumber';
import { currency, NUMERIC } from '../../../utils/format';
import { ReadingInterval } from './ReadingInterval';

export const PayDebtModal: React.FC<{
  open: boolean;
  debt: LedgerDebt;
  meterCode: string;
  onClose: () => void;
  /** Moves on to the confirmation; nothing is stored yet */
  onConfirm: () => void;
}> = ({ open, debt, meterCode, onClose, onConfirm }) => {
  // Preview of the correlative. What gets printed is the id the database
  // assigns, which comes back with the stored payment
  const { receiptNumber, isLoading: loadingReceipt } =
    useNextReceiptNumber(open);

  // Taken when the modal opens, only to be shown: the moment that ends up
  // stored is the server's, stamped when the payment is registered
  const now = useMemo(() => new Date(), [open]);
  const shownDate = now.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const shownTime = now.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <Dialog
      open={open}
      handler={onClose}
      size='sm'
      dismiss={{ escapeKey: true, outsidePress: false }}
    >
      <DialogHeader className='flex flex-col items-start gap-0 pb-2'>
        <Typography variant='h4' color='blue-gray'>
          Registrar pago
        </Typography>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Medidor <span className={NUMERIC}>{meterCode}</span> · {debt.period}{' '}
          {debt.year}
        </Typography>
      </DialogHeader>

      <DialogBody className='flex flex-col gap-4 pt-0'>
        {/* What is being charged, so the amount is never taken on faith */}
        {/* Shown but not editable: cash is the only way the OTB collects, the
            payment is happening now, and the receipt number is the correlative
            the database will assign. There is nothing to choose */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row gap-3'>
            {/* <Input
              label='Forma de pago'
              crossOrigin={undefined}
              value='Efectivo'
              readOnly
              className='!bg-blue-gray-50/60'
            /> */}
              <Input
                label='Fecha'
                crossOrigin={undefined}
                value={shownDate}
                readOnly
                className='!bg-blue-gray-50/60'
              />
              <Input
                label='Hora'
                crossOrigin={undefined}
                value={shownTime}
                readOnly
                className='!bg-blue-gray-50/60'
              />
            
          </div>

          <Input
            label='N° de recibo'
            crossOrigin={undefined}
            value={loadingReceipt ? 'Asignando...' : receiptNumber}
            readOnly
            className={`!bg-blue-gray-50/60 ${NUMERIC}`}
          />
        </div>
        <div className='rounded-lg border border-blue-gray-100 bg-blue-gray-50/40 p-3'>
          <ReadingInterval
            previousReading={debt.previous_reading}
            currentReading={debt.current_reading}
            consumption={debt.consumption}
          />
          <div className='mt-3 flex items-baseline justify-between'>
            <span className='text-sm font-medium text-blue-gray-600'>
              Total a pagar
            </span>
            <span className={`text-2xl font-bold text-amber-800 ${NUMERIC}`}>
              {currency(debt.amount)}
            </span>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className='flex flex-col-reverse gap-2 pt-0 sm:flex-row'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={onClose}
          className='w-full sm:w-auto'
        >
          Cancelar
        </Button>
        <Button
          color='green'
          onClick={onConfirm}
          disabled={loadingReceipt}
          className='w-full sm:w-auto'
        >
          Continuar
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
