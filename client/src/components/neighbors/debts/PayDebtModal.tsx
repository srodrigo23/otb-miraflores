import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Textarea,
  Typography,
} from '@material-tailwind/react';
import {
  BanknotesIcon,
  // BuildingLibraryIcon,
  // QrCodeIcon,
} from '@heroicons/react/24/outline';

import { LedgerDebt } from '../../../interfaces/neighborDebtsInterfaces';
import { getTodayDate } from '../../../utils/dates';
import { currency, NUMERIC } from '../../../utils/format';
import { ReadingInterval } from './ReadingInterval';

export type PaymentMethod = 'CASH' | 'QR' | 'TRANSFER';

export type PayDebtFormValues = {
  method: PaymentMethod;
  date: string;
  receipt: string;
  notes: string;
};

const METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'CASH', label: 'Efectivo', icon: BanknotesIcon },
  // { value: 'QR', label: 'QR', icon: QrCodeIcon },
  // { value: 'TRANSFER', label: 'Transferencia', icon: BuildingLibraryIcon },
];

export const PayDebtModal: React.FC<{
  open: boolean;
  debt: LedgerDebt;
  meterCode: string;
  onClose: () => void;
  onConfirm: (values: PayDebtFormValues) => void | Promise<unknown>;
}> = ({ open, debt, meterCode, onClose, onConfirm }) => {
  // The receipt takes a moment to render: hold the dialog open until it is out
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayDebtFormValues>({
    defaultValues: {
      method: 'CASH',
      date: getTodayDate(),
      receipt: '',
      notes: '',
    },
  });

  // Reopening the modal should not carry over what was typed last time
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const selectedMethod = watch('method');

  const onSubmit: SubmitHandler<PayDebtFormValues> = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(values);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* <p className='mt-1 text-xs text-blue-gray-500'>
            La deuda se salda completa. No se aceptan pagos parciales.
          </p> */}
        </div>

        <form
          id='pay-debt-form'
          className='flex flex-col gap-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <fieldset>
            <legend className='mb-2 text-sm font-medium text-blue-gray-700'>
              Forma de pago
            </legend>
            <div className='grid grid-cols-3 gap-2'>
              {METHODS.map(({ value, label, icon: Icon }) => {
                const isSelected = selectedMethod === value;
                return (
                  <button
                    key={value}
                    type='button'
                    aria-pressed={isSelected}
                    onClick={() => setValue('method', value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900'
                        : 'border-blue-gray-100 text-blue-gray-600 hover:border-blue-gray-300'
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                    {label}
                  </button>
                );
              })}
            </div>
            <input type='hidden' {...register('method')} />
          </fieldset>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Input
                type='date'
                label='Fecha de pago'
                crossOrigin={undefined}
                {...register('date', { required: true })}
                error={!!errors.date}
              />
              {errors.date && (
                <Typography variant='small' color='red' className='mt-1 font-normal'>
                  Campo requerido
                </Typography>
              )}
            </div>
            <div>
              <Input
                label='N° de recibo'
                crossOrigin={undefined}
                {...register('receipt', { required: true })}
                error={!!errors.receipt}
              />
              {errors.receipt && (
                <Typography variant='small' color='red' className='mt-1 font-normal'>
                  Campo requerido
                </Typography>
              )}
            </div>
          </div>

          <Textarea
            label='Observaciones'
            {...register('notes', { maxLength: 200 })}
          />
        </form>
      </DialogBody>

      <DialogFooter className='flex flex-col-reverse gap-2 pt-0 sm:flex-row'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={onClose}
          className='w-full sm:w-auto'
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type='submit'
          form='pay-debt-form'
          color='green'
          className='w-full sm:w-auto'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generando recibo...' : 'Registrar pago'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
