import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from '@material-tailwind/react';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';

import { MeterLedger } from '../../../interfaces/neighborDebtsInterfaces';
import { NUMERIC } from '../../../utils/format';
import { EmptyState } from '../../shared/EmptyState';
import { DebtCard } from './DebtCard';
import { PaymentCard } from './PaymentCard';

/** Debts and payments of one meter, one tab each */
export const MeterLedgerPanel: React.FC<{ meter: MeterLedger }> = ({
  meter,
}) => {
  // Only what is still owed: a settled debt lives on in the payments tab
  const pendingDebts = meter.debts.filter((debt) => debt.status === 'PENDING');

  const tabs = [
    {
      label: 'Deudas',
      value: 'debts',
      icon: <BanknotesIcon className='h-4 w-4' />,
      count: pendingDebts.length,
      content:
        pendingDebts.length === 0 ? (
          <EmptyState message='Este medidor no tiene deudas pendientes.' />
        ) : (
          <div className='flex flex-col gap-2'>
            {pendingDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} meterCode={meter.code} />
            ))}
          </div>
        ),
    },
    {
      label: 'Pagos',
      value: 'payments',
      icon: <CreditCardIcon className='h-4 w-4' />,
      count: meter.payments.length,
      content:
        meter.payments.length === 0 ? (
          <EmptyState message='Todavía no se registran pagos para este medidor.' />
        ) : (
          <div className='flex flex-col gap-2'>
            {meter.payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        ),
    },
  ];

  return (
    <div className='flex min-h-[16rem] flex-col rounded-lg border border-blue-gray-100 bg-white p-3'>
      <Tabs value='debts' className='flex min-h-0 flex-1 flex-col'>
        <TabsHeader className='shrink-0'>
          {tabs.map(({ label, value, icon, count }) => (
            <Tab key={value} value={value}>
              <div className='flex items-center gap-2'>
                {icon}
                <span className='text-sm font-semibold'>{label}</span>
                <span
                  className={`rounded-full bg-blue-gray-100 px-1.5 text-xs text-blue-gray-700 ${NUMERIC}`}
                >
                  {count}
                </span>
              </div>
            </Tab>
          ))}
        </TabsHeader>
        <TabsBody className='min-h-0 flex-1 overflow-y-auto'>
          {tabs.map(({ value, content }) => (
            <TabPanel key={value} value={value} className='h-full px-1 py-2'>
              {content}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
    </div>
  );
};
