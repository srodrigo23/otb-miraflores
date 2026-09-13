import { useParams } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { usePublicReceipt } from '../../hooks/receipts/usePublicReceipt';
import {
  PublicReceiptDebt,
  PublicReceiptYear,
} from '../../interfaces/receiptsInterfaces';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { currency, NUMERIC } from '../../utils/format';
import { formatDate, formatTime } from '../../utils/dates';

/** One labelled fact of the receipt */
const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <div className='text-xs text-blue-gray-500'>{label}</div>
    <div className='text-sm font-semibold text-blue-gray-900'>{children}</div>
  </div>
);

const DebtRow: React.FC<{ debt: PublicReceiptDebt }> = ({ debt }) => {
  const isPaid = debt.status === 'PAID';

  return (
    <li className='flex items-center gap-3 py-2'>
      {isPaid ? (
        <CheckCircleIcon className='h-5 w-5 shrink-0 text-green-600' />
      ) : (
        <ExclamationTriangleIcon className='h-5 w-5 shrink-0 text-amber-600' />
      )}

      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm font-semibold text-blue-gray-900'>
          {debt.period}
        </div>
        <div className='truncate text-xs text-blue-gray-500'>
          Medidor <span className={NUMERIC}>{debt.meter_code}</span> ·{' '}
          <span className={NUMERIC}>{debt.consumption}</span> m³
          {isPaid && debt.receipt_number && (
            <>
              {' '}
              · Recibo <span className={NUMERIC}>{debt.receipt_number}</span>
            </>
          )}
        </div>
      </div>

      <div
        className={`shrink-0 text-sm font-bold ${NUMERIC} ${
          isPaid ? 'text-blue-gray-400 line-through' : 'text-amber-800'
        }`}
      >
        {currency(debt.amount)}
      </div>
    </li>
  );
};

const YearBlock: React.FC<{ gestion: PublicReceiptYear }> = ({ gestion }) => {
  const isSettled = gestion.pending_count === 0;

  return (
    <section className='rounded-xl border border-blue-gray-100 bg-white shadow-sm'>
      <header className='flex flex-wrap items-center justify-between gap-2 border-b border-blue-gray-50 px-4 py-3'>
        <h3 className={`text-lg font-bold text-blue-gray-900 ${NUMERIC}`}>
          Gestión {gestion.year}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isSettled
              ? 'bg-green-50 text-green-800'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {isSettled
            ? 'Al día'
            : `${gestion.pending_count} pendiente${gestion.pending_count === 1 ? '' : 's'}`}
        </span>
      </header>

      <div className='grid grid-cols-2 gap-2 border-b border-blue-gray-50 px-4 py-3'>
        <div>
          <div className='text-xs text-blue-gray-500'>Pagado</div>
          <div className={`text-base font-bold text-green-700 ${NUMERIC}`}>
            {currency(gestion.paid_amount)}
          </div>
        </div>
        <div>
          <div className='text-xs text-blue-gray-500'>Por pagar</div>
          <div
            className={`text-base font-bold ${NUMERIC} ${
              gestion.pending_amount > 0
                ? 'text-amber-800'
                : 'text-blue-gray-400'
            }`}
          >
            {currency(gestion.pending_amount)}
          </div>
        </div>
      </div>

      <ul className='divide-y divide-blue-gray-50 px-4 py-1'>
        {gestion.debts.map((debt) => (
          <DebtRow key={debt.id} debt={debt} />
        ))}
      </ul>
    </section>
  );
};

/**
 * Where a scanned receipt QR lands. Public on purpose: the reader is a neighbor
 * holding their own paper, not someone logged into the system.
 */
const PublicReceipt = () => {
  const { reference } = useParams();
  const { receipt, isLoading, error } = usePublicReceipt(reference);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <LoaderAnimation fullScreen={false} />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center'>
        <ExclamationTriangleIcon className='h-12 w-12 text-red-400' />
        <h1 className='text-lg font-bold text-blue-gray-800'>
          Recibo no encontrado
        </h1>
        <p className='text-sm text-blue-gray-500'>
          El código escaneado no corresponde a ningún recibo registrado.
        </p>
      </div>
    );
  }

  const isUpToDate = receipt.total_pending === 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-gray-900 px-4 py-4 text-white'>
        <div className='mx-auto flex max-w-2xl items-center gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md'>
            <Droplets className='h-5 w-5' />
          </span>
          <div>
            <div className='text-lg font-extrabold leading-tight'>
              OTB Miraflores
            </div>
            <div className='text-[11px] text-gray-400'>
              Comprobante de pago
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto flex max-w-2xl flex-col gap-4 px-4 py-5'>
        {/* The receipt this QR was printed on */}
        <section className='rounded-xl border border-blue-gray-100 bg-white p-4 shadow-sm'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <div className='text-xs text-blue-gray-500'>Recibo N°</div>
              <div className={`text-2xl font-extrabold text-blue-gray-900 ${NUMERIC}`}>
                {receipt.receipt_number}
              </div>
            </div>
            <div className='text-right'>
              <div className='text-xs text-blue-gray-500'>Monto pagado</div>
              <div className={`text-2xl font-extrabold text-green-700 ${NUMERIC}`}>
                {currency(receipt.amount)}
              </div>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-3 border-t border-blue-gray-50 pt-3'>
            <Fact label='Vecino'>{receipt.neighbor.full_name}</Fact>
            <Fact label='Fecha de pago'>
              {receipt.paid_at
                ? `${formatDate(receipt.paid_at)} ${formatTime(receipt.paid_at)}`
                : '—'}
            </Fact>
            <Fact label='Periodo'>
              {receipt.period} <span className={NUMERIC}>{receipt.year}</span>
            </Fact>
            <Fact label='Medidor'>
              <span className={NUMERIC}>{receipt.meter_code}</span>
            </Fact>
            <Fact label='Lecturas'>
              <span className={NUMERIC}>
                {receipt.previous_reading} → {receipt.current_reading}
              </span>
            </Fact>
            <Fact label='Consumo'>
              <span className={NUMERIC}>{receipt.consumption}</span> m³
            </Fact>
          </div>
        </section>

        {/* Where the neighbor stands overall */}
        <section
          className={`rounded-xl border p-4 shadow-sm ${
            isUpToDate
              ? 'border-green-200 bg-green-50/60'
              : 'border-amber-200 bg-amber-50/60'
          }`}
        >
          <div className='flex items-center gap-2'>
            {isUpToDate ? (
              <CheckCircleIcon className='h-6 w-6 shrink-0 text-green-700' />
            ) : (
              <ExclamationTriangleIcon className='h-6 w-6 shrink-0 text-amber-700' />
            )}
            <h2
              className={`text-base font-bold ${
                isUpToDate ? 'text-green-900' : 'text-amber-900'
              }`}
            >
              {isUpToDate
                ? 'No tiene deudas pendientes'
                : `Tiene ${currency(receipt.total_pending)} por pagar`}
            </h2>
          </div>
          <p className='mt-1 text-sm text-blue-gray-600'>
            Total pagado a la fecha:{' '}
            <span className={`font-semibold ${NUMERIC}`}>
              {currency(receipt.total_paid)}
            </span>
          </p>
        </section>

        {/* One block per year, newest first */}
        {receipt.years.map((gestion) => (
          <YearBlock key={gestion.year} gestion={gestion} />
        ))}

        <p className='pb-6 text-center text-[11px] text-blue-gray-400'>
          Ref. <span className={NUMERIC}>{receipt.reference}</span>
        </p>
      </main>
    </div>
  );
};

export default PublicReceipt;
