import { useState } from 'react';
import { Button } from '@material-tailwind/react';

import {
  DebtStatus,
  LedgerDebt,
} from '../../../interfaces/neighborDebtsInterfaces';
import { currency, NUMERIC } from '../../../utils/format';
import {
  PaymentReceipt,
  type ReceiptNeighbor,
} from '../../../reports/PaymentReceipt';
import { openReport, reportFileName } from '../../../reports/openReport';
import {
  createReceiptReference,
  receiptPublicUrl,
  toQrDataUrl,
} from '../../../reports/qrDataUrl';
import { ReadingInterval } from './ReadingInterval';
import { PayDebtModal } from './PayDebtModal';
import { usePayDebt } from '../../../hooks/neighbors/usePayDebt';
import ConfirmPaymentModal from '../../modals/ConfirmPaymentModal';

// Cash is the only way the OTB collects, so the receipt states it
const PAYMENT_METHOD_LABEL = 'Efectivo';

/**
 * Badge classes are written in full: Tailwind scans the source for literal
 * class names, so `bg-${color}-50` would never be generated
 */
const DEBT_STATUS: Record<DebtStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Pendiente', badge: 'bg-amber-50 text-amber-800' },
  PAID: { label: 'Pagada', badge: 'bg-green-50 text-green-800' },
  CANCELLED: { label: 'Anulada', badge: 'bg-blue-gray-50 text-blue-gray-700' },
};

export const DebtCard: React.FC<{
  debt: LedgerDebt;
  meterCode: string;
  neighbor: ReceiptNeighbor;
  /** Re-reads the ledger once the payment is stored */
  onPaid?: () => void | Promise<unknown>;
}> = ({ debt, meterCode, neighbor, onPaid }) => {
  const status = DEBT_STATUS[debt.status];
  const isPending = debt.status === 'PENDING';
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { payDebt, isSaving } = usePayDebt();

  // Nothing is stored until the confirmation is given
  const handleContinue = () => {
    setIsPayOpen(false);
    setIsConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    // Back to the summary, not out of the flow
    setIsConfirmOpen(false);
    setIsPayOpen(true);
  };

  /**
   * Stores the payment first and only then issues the receipt: handing over a
   * receipt for something that was not recorded is the worse of the two
   * failures.
   */
  const handleConfirmPayment = async () => {
    const reference = createReceiptReference();

    const payment = await payDebt(debt.id, { received_by: null });
    if (payment === null) return;

    setIsConfirmOpen(false);
    const qrDataUrl = await toQrDataUrl(receiptPublicUrl(reference));

    await openReport(
      <PaymentReceipt
        debt={debt}
        meterCode={meterCode}
        neighbor={neighbor}
        payment={{
          // The correlative the database assigned, not a previewed guess
          receipt: payment.receipt_number,
          // The moment the server stamped, not the one the browser guessed
          date: payment.paid_at ?? new Date().toISOString(),
          method: PAYMENT_METHOD_LABEL,
          reference,
          qrDataUrl,
        }}
      />,
      reportFileName(['recibo', payment.receipt_number]),
    );

    await onPaid?.();
  };

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
        <>
          <PayDebtModal
            open={isPayOpen}
            debt={debt}
            meterCode={meterCode}
            onClose={() => setIsPayOpen(false)}
            onConfirm={handleContinue}
          />

          <ConfirmPaymentModal
            openModalState={isConfirmOpen}
            handleCloseModal={handleCancelConfirm}
            debt={debt}
            meterCode={meterCode}
            onConfirmPayment={handleConfirmPayment}
            isSaving={isSaving}
          />
        </>
      )}
    </article>
  );
};
