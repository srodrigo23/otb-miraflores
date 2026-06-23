import { useState, useMemo } from 'react';
import {
  Typography,
  IconButton,
  // Button,
  // Chip,
} from '@material-tailwind/react';
import {
  ChevronUpDownIcon,
  PencilIcon,
  TrashIcon,
  // EyeIcon,
  DocumentMagnifyingGlassIcon,
  CurrencyDollarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import { MeasureTableProps } from '../../types/MeasuresTypes';

type SortField = 'id' | 'measure_date' | 'period' | 'reader_name' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'ID', field: 'id' as SortField, sortable: true },
  { label: 'Fecha de Medición', field: 'measure_date' as SortField, sortable: true },
  { label: 'Periodo', field: 'period' as SortField, sortable: true },
  // { label: 'Responsable', field: 'reader_name' as SortField, sortable: true },
  // { label: 'Estado', field: 'status' as SortField, sortable: true },
  // { label: 'Núm. de Medidores', field: null, sortable: false },
  // { label: 'Fecha Creación', field: 'created_at' as SortField, sortable: true },
  { label: 'Acciones', field: null, sortable: false },
];

// const STATUS_COLORS: { [key: string]: string } = {
//   in_progress: 'blue',
//   completed: 'green',
//   cancelled: 'red',
// };

// const STATUS_LABELS: { [key: string]: string } = {
//   in_progress: 'En Progreso',
//   completed: 'Completada',
//   cancelled: 'Cancelada',
// };

const MeasureTable: React.FC<MeasureTableProps> = ({
  tableData,
  onEdit,
  onDelete,
  // onCreate,
  // onView,
  onViewReadings,
  // onGenerateDebts,
  // onDeleteDebts,
}) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;

  // Ordenar datos
  const sortedData = useMemo(() => {
    const sorted = [...tableData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

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
  }, [tableData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className='flex flex-col h-full'>
      

      {/* Tabla con scroll interno */}
      <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg'>
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
                  onClick={() =>
                    head.sortable && head.field && handleSort(head.field)
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
            {sortedData.map((measure, index) => {
              const isLast = index === sortedData.length - 1;
              const classes = isLast
                ? 'p-3'
                : 'p-3 border-b border-blue-gray-50';

              return (
                <tr key={measure.id} className='hover:bg-blue-gray-50/50'>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {measure.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium text-center'
                    >
                      {formatDate(measure.measure_date)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {measure.period || '-'}
                    </Typography>
                  </td>
                  {/* <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {measure.reader_name || '-'}
                    </Typography>
                  </td> */}
                  {/* <td className={classes}>
                    <div className='flex justify-center'>
                      <Chip
                        // className='w-fit'
                        size='sm'
                        value={STATUS_LABELS[measure.status] || measure.status}
                        color={(STATUS_COLORS[measure.status] || 'gray') as any}
                      />
                    </div>
                  </td> */}
                  {/* <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {measure.meters_read}/{measure.total_meters}
                    </Typography>
                  </td> */}
                  {/* <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center'
                    >
                      {formatDate(measure.created_at)}
                    </Typography>
                  </td> */}
                  <td className={classes}>
                    <div className='flex justify-center gap-2'>
                      {
                      // onGenerateDebts && 
                      (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='green'
                          // onClick={() => onGenerateDebts(measure)}
                          title='Generar deudas'
                        >
                          <CurrencyDollarIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {
                      // onDeleteDebts && 
                      (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='orange'
                          // onClick={() => onDeleteDebts(measure)}
                          title='Eliminar deudas'
                        >
                          <XCircleIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {onViewReadings && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='purple'
                          onClick={() => onViewReadings(measure)}
                          title='Ver lecturas'
                        >
                          <DocumentMagnifyingGlassIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {/* {onView && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => onView(measure)}
                          title='Ver detalles'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </IconButton>
                      )} */}
                      {onEdit && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => onEdit(measure)}
                          title='Editar'
                        >
                          <PencilIcon className='h-4 w-4 text-black' />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='red'
                          onClick={() => onDelete(measure)}
                          title='Eliminar'
                        >
                          <TrashIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* <div className='flex items-center justify-between border-t border-blue-gray-100 p-4 flex-shrink-0'>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Total: {sortedData.length} mediciones
        </Typography>
      </div> */}
    </div>
  );
};

export default MeasureTable;
