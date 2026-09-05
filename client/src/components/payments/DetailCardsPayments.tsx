import {
  BanknotesIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';

import { PaymentRecord } from '../../interfaces/paymentsInterfaces';
import { currency } from '../../utils/format';
import { StatCardGrid, StatDescriptor } from '../shared/StatCardGrid';

const totalCollected = (payments: PaymentRecord[]) =>
  payments.reduce((total, payment) => total + payment.amount, 0);

const STATS: StatDescriptor<PaymentRecord[]>[] = [
  {
    label: 'Total recaudado',
    icon: BanknotesIcon,
    tone: 'green',
    value: (payments) => currency(totalCollected(payments)),
  },
  {
    label: 'Pagos registrados',
    icon: ReceiptPercentIcon,
    tone: 'blue-gray',
    value: (payments) => payments.length,
  },
  {
    label: 'Medidores cobrados',
    icon: UserGroupIcon,
    tone: 'blue',
    value: (payments) =>
      new Set(payments.map((payment) => payment.meter_code)).size,
  },
  {
    label: 'Promedio por pago',
    icon: CalculatorIcon,
    tone: 'amber',
    value: (payments) =>
      payments.length === 0
        ? currency(0)
        : currency(Math.round(totalCollected(payments) / payments.length)),
  },
];

/** Summary of the payments currently in view: it follows the active filters */
export const DetailCardsPayments: React.FC<{ payments: PaymentRecord[] }> = ({
  payments,
}) => <StatCardGrid stats={STATS} data={payments} />;
