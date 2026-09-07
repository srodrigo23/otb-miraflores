import { useMemo, useState } from 'react';
import { IconButton, Typography } from '@material-tailwind/react';
import { ChevronUpDownIcon, EyeIcon } from '@heroicons/react/24/outline';

import { NeighborsViewProps } from '../../types/NeighborsTypes';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { fullName } from '../../utils/neighbors';
import { NUMERIC } from '../../utils/format';
import { EmptyState } from '../shared/EmptyState';

type SortField = 'id' | 'last_name' | 'ci' | 'phone_number' | 'email';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'Num.', field: 'id' as SortField, sortable: true },
  { label: 'Nombre Completo', field: 'last_name' as SortField, sortable: true },
  { label: 'CI', field: 'ci' as SortField, sortable: true },
  { label: 'Celular', field: 'phone_number' as SortField, sortable: true },
  // { label: 'Correo', field: 'email' as SortField, sortable: true },
  { label: '', field: null, sortable: false },
];

/** The name column sorts by surname, matching how the register is ordered. */
const sortValue = (neighbor: NeighborType, field: SortField) =>
  field === 'last_name' ? fullName(neighbor) : neighbor[field];

const NeighborTable: React.FC<NeighborsViewProps> = ({
  neighbors,
  totalCount,
  searchTerm,
  neighborSelected,
  onSelectNeighbor,
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const sortedData = useMemo(() => {
    const direction = sortOrder === 'asc' ? 1 : -1;

    return [...neighbors].sort((a, b) => {
      const aValue = sortValue(a, sortField);
      const bValue = sortValue(b, sortField);

      // Blanks sink to the bottom in both directions: a neighbor with no CI on
      // record should never outrank one that has it.
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      return 0;
    });
  }, [neighbors, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    /* Table with its own scroll, so the page header above stays put */
    <div className='min-h-0 flex-1 overflow-auto rounded-lg border border-blue-gray-100'>
      {sortedData.length > 0 ? (
        <table className='w-full min-w-max table-auto text-left'>
          <thead className='sticky top-0 z-10 bg-blue-gray-50'>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head.label}
                  className={`border-b border-blue-gray-100 bg-blue-gray-50 py-2 ${
                    head.sortable
                      ? 'cursor-pointer transition-colors hover:bg-blue-gray-100'
                      : ''
                  }`}
                  onClick={() =>
                    head.sortable && head.field && handleSort(head.field)
                  }
                >
                  <div className='flex items-center justify-center gap-2'>
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
            {sortedData.map((neighbor) => {
              const isSelected = neighborSelected?.id === neighbor.id;
              const classes = 'border border-blue-gray-50 p-3 py-1';

              return (
                <tr
                  key={neighbor.id}
                  onClick={() => onSelectNeighbor(neighbor)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-blue-gray-50/50'
                  }`}
                >
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`text-center font-normal ${NUMERIC}`}
                    >
                      {neighbor.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {fullName(neighbor)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`text-center font-medium ${NUMERIC}`}
                    >
                      {neighbor.ci ?? '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className={`text-center font-normal ${NUMERIC}`}
                    >
                      {neighbor.phone_number ?? '-'}
                    </Typography>
                  </td>
                  {/* <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal'
                      >
                        {neighbor.email || '-'}
                      </Typography>
                    </td> */}
                  <td className={classes}>
                    <div className='flex justify-center gap-2'>
                      <IconButton
                        size='sm'
                        variant='text'
                        color='blue'
                        onClick={(e) => {
                          // The whole row is clickable; don't fire twice.
                          e.stopPropagation();
                          onSelectNeighbor(neighbor);
                        }}
                        title='Ver detalles'
                      >
                        <EyeIcon className='h-4 w-4' />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <EmptyState
          message={
            totalCount === 0
              ? 'Aún no hay vecinos registrados.'
              : `No se encontraron vecinos para “${searchTerm}”.`
          }
        />
      )}
    </div>
  );
};

export default NeighborTable;
