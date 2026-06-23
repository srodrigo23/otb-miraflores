import {
  Typography,
  Checkbox,
} from '@material-tailwind/react';
import {
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

import { useState, useMemo } from 'react';

type SortField =
  | 'num'
  | 'period'
  | 'lastReading'
  | 'currentReading'
  | 'consumption'
  | 'amount'
  // | 'selection';

type SortOrder = 'asc' | 'desc';

const DebtsTable = () => {
  const [sortField, 
    // setSortField
  ] = useState<SortField>('num');
  const [sortOrder, 
    // setSortOrder
  ] = useState<SortOrder>('asc');
  const TABLE_HEAD = [
    {
      label: 'Num.',
      field: 'num',
      sortable: true,
    },
    {
      label: 'Periodo',
      field: 'period',
      sortable: true,
    },
    {
      label: 'Lect. Anterior',
      field: 'lastReading',
      sortable: true,
    },
    {
      label: 'Lect. Actual',
      field: 'currentReading',
      sortable: true,
    },
    {
      label: 'Consumo',
      field: 'consumption',
      sortable: true,
    },
    {
      label: 'Monto',
      field: 'amount',
      sortable: true,
    },
    {
      label: 'Selección',
      field: 'selection',
      sortable: false,
    },
  ];

  const TABLE_BODY = [
    {
      num: 1,
      period: 'JUL-AGO-2025',
      lastReading: 123,
      currentReading: 456,
      consumption: 678,
      amount: 678,
    },
    {
      num: 2,
      period: 'SEPT-OCT-2025',
      lastReading: 123,
      currentReading: 456,
      consumption: 678,
      amount: 678,
    },
    {
      num: 3,
      period: 'NOV-DIC-2025',
      lastReading: 123,
      currentReading: 456,
      consumption: 678,
      amount: 678,
    },
  ];

  // const handleSort = (field: SortField) => {
  //   if (sortField === field) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortField(field);
  //     setSortOrder('asc');
  //   }
  // };

  // Ordenar datos
  const sortedData = useMemo(() => {
    const sorted = [...TABLE_BODY].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // if (sortField === 'first_name') {
      //   aValue = `${a.first_name} ${a.second_name}`;
      //   bValue = `${b.first_name} ${b.second_name}`;
      // }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
    return sorted;
  }, [TABLE_HEAD, sortField, sortOrder]);

  return (
    <div className='h-full'>
      <table className='w-full min-w-max table-auto text-left'>
        <thead className='sticky top-0 bg-blue-gray-50 z-10'>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head.label}
                className={`border-b border-blue-gray-100 bg-blue-gray-50 py-1 ${
                  head.sortable
                    ? 'cursor-pointer hover:bg-blue-gray-100 transition-colors'
                    : ''
                }`}
                onClick={() =>{}
                  // head.sortable && head.field && handleSort(head.field)
                }
              >
                <div className='flex justify-center items-center gap-2'>
                  <Typography
                    variant='small'
                    color='blue-gray'
                    className='font-normal leading-none opacity-70'
                  >
                    {head.label}
                  </Typography>
                  {head.sortable && (
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
          {sortedData.map(
            (
              { amount, consumption, currentReading, lastReading, period },
              index,
            ) => {
              // const isLast = index === TABLE_BODY.length - 1;
              const classes = 'border-b border-blue-gray-50';
              return (
                <tr key={index} className='hover:bg-blue-gray-50/50'>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {index + 1}
                    </Typography>
                  </td>

                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      <a className='cursor-pointer'>{period}</a>
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {lastReading}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {currentReading}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {consumption}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {amount}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      <Checkbox color='blue' defaultChecked />
                    </Typography>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DebtsTable;