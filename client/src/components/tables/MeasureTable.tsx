import { useState, useMemo } from 'react';
import {
  Typography,
  IconButton,
  Chip,
} from '@material-tailwind/react';
import {
  ChevronUpDownIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { MeasureTableProps } from '../../types/MeasuresTypes';
import { useNavigate } from 'react-router-dom';
import { color } from '../../types/commonTypes';

type SortField = 'id' | 'measure_date' | 'period' | 'reader_name' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'Num.', field: 'id' as SortField, sortable: true },
  { label: 'Periodo', field: 'period' as SortField, sortable: true },
  { label: 'Fecha de Medición', field: 'measure_date' as SortField, sortable: true },
  { label: 'Responsable', field: 'reader_name' as SortField, sortable: false },
  { label: 'Estado', field: 'status' as SortField, sortable: false},
  { label: 'Acciones', field: null, sortable: false },
];

const STATUS_COLORS: { [key: string]: string } = {
  CREATED: 'green',
  IN_PROGRESS: 'blue',
  CLOSED: 'red',
};

const STATUS_LABELS: { [key: string]: string } = {
  CREATED: 'Creado',
  IN_PROGRESS: 'En Progreso',
  CLOSED: 'Cerrado',
};

const MeasureTable: React.FC<MeasureTableProps> = ({
  tableData,  
  // onEdit,
  onDelete,
  // onCreate,
  // onView,
  // onViewReadings,
  // onGenerateDebts,
  // onDeleteDebts,
}) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;
  const navigate = useNavigate();
  

  // Ordenar datos
  const sortedData = useMemo(() => {
    const sorted = [...tableData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
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
            {sortedData.map((measure) => {
              // const isLast = index === sortedData.length - 1;
              const classes = 'p-3 border border-blue-gray-50 py-1';

              return (
                <tr key={measure.id} className={`hover:bg-blue-gray-50/50 ${measure.is_first_measure?'bg-green-50':''}`}>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal text-center py-0'
                    >
                      {measure.id}
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
                      {measure.reader_name || '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <div className='flex justify-center'>
                      <Chip
                        // className='w-fit'
                        size='sm'
                        value={STATUS_LABELS[measure.status] || measure.status}
                        color={(STATUS_COLORS[measure.status] || 'gray') as color}
                      />
                    </div>
                  </td>

                  <td className={classes}>
                    <div className='flex justify-center gap-2'>
                      {
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => navigate(`/mediciones?id=${measure.id}`)}
                          title='Ver detalles'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </IconButton>
                      }
                      {
                        <IconButton
                          size='sm'
                          variant='text'
                          color='red'
                          disabled={measure.is_first_measure}
                          onClick={() => onDelete(measure)}
                          title='Eliminar'
                        >
                          <TrashIcon className='h-4 w-4' />
                        </IconButton>
                      }
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
