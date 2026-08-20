import { useMemo, useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { PaymentRecord } from '../../interfaces/paymentsInterfaces';
import { formatDate, formatTime } from '../../utils/dates';
import { currency, NUMERIC } from '../../utils/format';

type SortField = 'paid_at' | 'meter_code' | 'neighbor_name' | 'amount';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD: {
  label: string;
  field?: SortField;
  align?: 'left' | 'center' | 'right';
}[] = [
  { label: 'Recibo' },
  { label: 'Medidor', field: 'meter_code' },
  { label: 'Vecino', field: 'neighbor_name', align: 'left' },
  { label: 'Responsable' },
  { label: 'Monto', field: 'amount', align: 'right' },
  { label: 'Fecha', field: 'paid_at' },
  { label: 'Hora' },
  { label: 'Observaciones', align: 'left' },
];

const EMPTY_VALUE = '-';

const PaymentsTable: React.FC<{ payments: PaymentRecord[] }> = ({
  payments,
}) => {
  const [sortField, setSortField] = useState<SortField>('paid_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortOrder('asc');
  };

  const sortedData = useMemo(() => {
    const direction = sortOrder === 'asc' ? 1 : -1;
    return [...payments].sort((a, b) => {
      if (sortField === 'amount') return (a.amount - b.amount) * direction;
      return String(a[sortField]).localeCompare(String(b[sortField])) * direction;
    });
  }, [payments, sortField, sortOrder]);

  if (payments.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center border border-blue-gray-100 rounded-lg'>
        <Typography variant='small' color='gray'>
          No hay pagos que coincidan con los filtros.
        </Typography>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg'>
        <table className='w-full min-w-max table-auto text-left'>
          <thead className='sticky top-0 bg-blue-gray-50 z-10'>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head.label}
                  className={`border-b border-blue-gray-100 bg-blue-gray-50 py-1 px-3 ${
                    head.field
                      ? 'cursor-pointer hover:bg-blue-gray-100 transition-colors'
                      : ''
                  }`}
                  onClick={() => head.field && handleSort(head.field)}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      head.align === 'left' ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal leading-none opacity-70'
                    >
                      {head.label}
                    </Typography>
                    {head.field && (
                      <ChevronUpDownIcon
                        className={`h-4 w-4 ${
                          sortField === head.field ? 'text-blue-500' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((payment) => {
              const classes = 'p-3 border border-blue-gray-50 py-1';
              return (
                <tr key={payment.id} className='hover:bg-blue-gray-50/50'>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`font-normal text-center ${NUMERIC}`}
                    >
                      {payment.receipt}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`font-normal text-center ${NUMERIC}`}
                    >
                      {payment.meter_code}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {payment.neighbor_name}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {payment.collector_name}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`font-semibold text-right ${NUMERIC}`}
                    >
                      {currency(payment.amount)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`font-normal text-center ${NUMERIC}`}
                    >
                      {formatDate(payment.paid_at)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`font-normal text-center ${NUMERIC}`}
                    >
                      {formatTime(payment.paid_at)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {payment.notes || EMPTY_VALUE}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;
