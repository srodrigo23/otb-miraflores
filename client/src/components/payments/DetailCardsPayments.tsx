import {
  BanknotesIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';

import { PaymentRecord } from '../../interfaces/paymentsInterfaces';
import { currency } from '../../utils/format';
import { StatCard, StatIcon, StatTone } from '../shared/StatCard';

type PaymentStat = {
  label: string;
  icon: StatIcon;
  tone: StatTone;
  /** Rendered as-is, so amounts can carry their currency */
  read: (payments: PaymentRecord[]) => string | number;
};

const totalCollected = (payments: PaymentRecord[]) =>
  payments.reduce((total, payment) => total + payment.amount, 0);

const STATS: PaymentStat[] = [
  {
    label: 'Total recaudado',
    icon: BanknotesIcon,
    tone: 'green',
    read: (payments) => currency(totalCollected(payments)),
  },
  {
    label: 'Pagos registrados',
    icon: ReceiptPercentIcon,
    tone: 'blue-gray',
    read: (payments) => payments.length,
  },
  {
    label: 'Medidores cobrados',
    icon: UserGroupIcon,
    tone: 'blue',
    read: (payments) =>
      new Set(payments.map((payment) => payment.meter_code)).size,
  },
  {
    label: 'Promedio por pago',
    icon: CalculatorIcon,
    tone: 'amber',
    read: (payments) =>
      payments.length === 0
        ? currency(0)
        : currency(Math.round(totalCollected(payments) / payments.length)),
  },
];

/** Summary of the payments currently in view: it follows the active filters */
export const DetailCardsPayments: React.FC<{ payments: PaymentRecord[] }> = ({
  payments,
}) => (
  <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 w-full'>
    {STATS.map(({ label, icon, tone, read }) => (
      <StatCard
        key={label}
        label={label}
        icon={icon}
        tone={tone}
        value={read(payments)}
      />
    ))}
  </div>
);
