import { useState, useMemo } from 'react';
import {
  Typography,
  IconButton,
  Button,
  Chip,
} from '@material-tailwind/react';
import {
  ChevronUpDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import NewCollectDebtModalForm from '../forms/NewCollectDebtModalForm';
// import NewPaymentModalForm from '../forms/newPaymentModalForm';

interface CollectDebtType {
  id: number;
  collect_date: string;
  period: string | null;
  collector_name: string | null;
  location: string | null;
  status: string;
  total_payments: number;
  total_collected: number;
  total_neighbors_paid: number;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type CollectDebtTableProps = {
  tableData: CollectDebtType[];
  onEdit?: (collectDebt: CollectDebtType) => void;
  onDelete?: (collectDebt: CollectDebtType) => void;
  onCreate?: (data: any) => void;
  onView?: (collectDebt: CollectDebtType) => void;
  onViewPayments?: (collectDebt: CollectDebtType) => void;
};

type SortField = 'id' | 'collect_date' | 'period' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'ID', field: 'id' as SortField, sortable: true },
  { label: 'Fecha', field: 'collect_date' as SortField, sortable: true },
  { label: 'Periodo', field: 'period' as SortField, sortable: true },
  { label: 'Cobrador', field: null, sortable: false },
  { label: 'Lugar', field: null, sortable: false },
  { label: 'Estado', field: 'status' as SortField, sortable: true },
  { label: 'Recaudado', field: null, sortable: false },
  { label: 'Vecinos', field: null, sortable: false },
  { label: 'Pagos', field: null, sortable: false },
  { label: 'Acciones', field: null, sortable: false },
];

const STATUS_COLORS: { [key: string]: string } = {
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_LABELS: { [key: string]: string } = {
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const CollectDebtTable: React.FC<CollectDebtTableProps> = ({
  tableData,
  onEdit,
  onDelete,
  onCreate,
  onView,
  onViewPayments,
}) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal para nueva recaudación
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(!openModal);


  const [openNewPaymentModal, setOpenNewPaymentModal] = useState<boolean>(false)
  const handleNewPaymentModal = () => setOpenNewPaymentModal(!openNewPaymentModal)


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

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Botón para crear nueva recaudación */}
      <div className='flex mb-4 justify-end'>
        <Button onClick={handleOpenModal}>NUEVA RECAUDACIÓN</Button>
      </div>

      <div className='flex mb-4 justify-end'>
        <Button onClick={handleNewPaymentModal} color='yellow'>
          Nuevo Pago
        </Button>
      </div>

      {/* Tabla con scroll interno */}
      <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg'>
        <table className='w-full min-w-max table-auto text-left'>
          <thead className='sticky top-0 bg-blue-gray-50 z-10'>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head.label}
                  className={`border-b border-blue-gray-100 bg-blue-gray-50 p-3 ${
                    head.sortable
                      ? 'cursor-pointer hover:bg-blue-gray-100 transition-colors'
                      : ''
                  }`}
                  onClick={() =>
                    head.sortable && head.field && handleSort(head.field)
                  }
                >
                  <div className='flex items-center gap-2'>
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
            {paginatedData.map((collectDebt, index) => {
              const isLast = index === paginatedData.length - 1;
              const classes = isLast
                ? 'p-3'
                : 'p-3 border-b border-blue-gray-50';

              return (
                <tr key={collectDebt.id} className='hover:bg-blue-gray-50/50'>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {formatDate(collectDebt.collect_date)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.period || '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.collector_name || '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.location || '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Chip
                      size='sm'
                      value={
                        STATUS_LABELS[collectDebt.status] || collectDebt.status
                      }
                      color={
                        (STATUS_COLORS[collectDebt.status] as any) || 'gray'
                      }
                    />
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-semibold'
                    >
                      Bs. {formatCurrency(collectDebt.total_collected)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.total_neighbors_paid}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {collectDebt.total_payments}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <div className='flex gap-2'>
                      {onViewPayments && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='purple'
                          onClick={() => onViewPayments(collectDebt)}
                          title='Ver pagos'
                        >
                          <BanknotesIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {onView && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => onView(collectDebt)}
                          title='Ver detalles'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {onEdit && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => onEdit(collectDebt)}
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
                          onClick={() => onDelete(collectDebt)}
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

      <NewCollectDebtModalForm
        openModalState={openModal}
        handleCloseModal={handleOpenModal}
        onSubmit={(data) => {
          if (onCreate) {
            onCreate(data);
          }
        }}
      />

      {/* <NewPaymentModalForm 
        openModalState={openNewPaymentModal} 
        handleCloseModal={handleNewPaymentModal} 
        onSubmit={()=>{}}
      /> */}

      {/* Controles de paginación */}
      <div className='flex items-center justify-between border-t border-blue-gray-100 p-4'>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Página {currentPage} de {totalPages} - Total: {sortedData.length}{' '}
          recaudaciones
        </Typography>
        <div className='flex gap-2'>
          <IconButton
            size='sm'
            variant='outlined'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span>←</span>
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              return (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              );
            })
            .map((page, index, array) => {
              const showEllipsisBefore =
                index > 0 && page - array[index - 1] > 1;
              return (
                <div key={page} className='flex gap-2'>
                  {showEllipsisBefore && <span className='px-2'>...</span>}
                  <IconButton
                    size='sm'
                    variant={currentPage === page ? 'filled' : 'outlined'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </IconButton>
                </div>
              );
            })}
          <IconButton
            size='sm'
            variant='outlined'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>→</span>
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default CollectDebtTable;
