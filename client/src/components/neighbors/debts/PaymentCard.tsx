import { LedgerPayment } from '../../../interfaces/neighborDebtsInterfaces';
import { formatDate } from '../../../utils/dates';
import { currency, NUMERIC } from '../../../utils/format';

export const PaymentCard: React.FC<{ payment: LedgerPayment }> = ({
  payment,
}) => (
  <article className='rounded-lg border border-blue-gray-100 bg-white p-3 transition-shadow hover:shadow-md'>
    <header className='mb-1 flex items-start justify-between gap-3'>
      <div>
        <h4
          className={`text-sm font-bold leading-tight text-blue-gray-800 ${NUMERIC}`}
        >
          {payment.receipt}
        </h4>
        <span className='text-xs text-blue-gray-500'>
          {formatDate(payment.date)}
        </span>
      </div>
      <div className={`text-base font-bold text-green-700 ${NUMERIC}`}>
        {currency(payment.amount)}
      </div>
    </header>
    <div className='flex items-center justify-between text-xs text-blue-gray-500'>
      <span>{payment.period}</span>
      <span>{payment.method}</span>
    </div>
  </article>
);
