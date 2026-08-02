import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import { toast } from 'react-toastify';

import {
  DebtStatus,
  LedgerDebt,
} from '../../../interfaces/neighborDebtsInterfaces';
import { currency, NUMERIC } from '../../../utils/format';
import { ReadingInterval } from './ReadingInterval';
import { PayDebtModal } from './PayDebtModal';

/**
 * Badge classes are written in full: Tailwind scans the source for literal
 * class names, so `bg-${color}-50` would never be generated
 */
const DEBT_STATUS: Record<DebtStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Pendiente', badge: 'bg-amber-50 text-amber-800' },
  PAID: { label: 'Pagada', badge: 'bg-green-50 text-green-800' },
};

export const DebtCard: React.FC<{ debt: LedgerDebt; meterCode: string }> = ({
  debt,
  meterCode,
}) => {
  const status = DEBT_STATUS[debt.status];
  const isPending = debt.status === 'PENDING';
  const [isPayOpen, setIsPayOpen] = useState(false);

  return (
    <article className='rounded-lg border border-blue-gray-100 bg-white p-3 transition-shadow hover:shadow-md'>
      <header className='mb-2 flex items-start justify-between gap-3'>
        <div>
          <h4 className='text-sm font-bold leading-tight text-blue-gray-800'>
            {debt.period}
          </h4>
          <span className={`text-xs text-blue-gray-500 ${NUMERIC}`}>
            {debt.year}
          </span>
        </div>
        {/* The amount is the whole story now: it is owed in full or it is settled */}
        <div
          className={`text-lg font-bold ${NUMERIC} ${
            isPending ? 'text-amber-800' : 'text-blue-gray-400 line-through'
          }`}
        >
          {currency(debt.amount)}
        </div>
      </header>

      <ReadingInterval
        previousReading={debt.previous_reading}
        currentReading={debt.current_reading}
        consumption={debt.consumption}
      />

      <footer className='mt-2 flex items-center justify-between gap-2'>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.badge}`}
        >
          {status.label}
        </span>
        {/* A settled debt has nothing left to charge */}
        {isPending && (
          <Button
            size='sm'
            color='green'
            variant='outlined'
            className='py-1'
            onClick={() => setIsPayOpen(true)}
          >
            Pagar
          </Button>
        )}
      </footer>

      {isPending && (
        <PayDebtModal
          open={isPayOpen}
          debt={debt}
          meterCode={meterCode}
          onClose={() => setIsPayOpen(false)}
          onConfirm={() =>
            // Visual only: nothing is persisted until the payments endpoint exists
            toast.info(
              `Pago de ${currency(debt.amount)} capturado en pantalla. Falta conectarlo al backend.`,
            )
          }
        />
      )}
    </article>
  );
};
