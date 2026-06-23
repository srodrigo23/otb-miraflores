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
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import NewMeetModalForm from '../forms/NewMeetModalForm';

interface MeetType {
  id: number;
  meet_date: string;
  meet_type: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  is_mandatory: boolean;
  total_neighbors: number;
  total_present: number;
  total_absent: number;
  total_on_time: number;
  organizer: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type MeetTableProps = {
  tableData: MeetType[];
  onEdit?: (meet: MeetType) => void;
  onDelete?: (meet: MeetType) => void;
  onCreate?: (data: any) => void;
  onView?: (meet: MeetType) => void;
  onViewAssistances?: (meet: MeetType) => void;
};

type SortField = 'id' | 'meet_date' | 'meet_type' | 'title' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'ID', field: 'id' as SortField, sortable: true },
  { label: 'Título', field: 'title' as SortField, sortable: true },
  { label: 'Fecha/Hora', field: 'meet_date' as SortField, sortable: true },
  { label: 'Tipo', field: 'meet_type' as SortField, sortable: true },
  { label: 'Lugar', field: null, sortable: false },
  { label: 'Estado', field: 'status' as SortField, sortable: true },
  { label: 'Asistencia', field: null, sortable: false },
  { label: 'Obligatoria', field: null, sortable: false },
  { label: 'Acciones', field: null, sortable: false },
];

const STATUS_COLORS: { [key: string]: string } = {
  scheduled: 'blue',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_LABELS: { [key: string]: string } = {
  scheduled: 'Programada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const MEET_TYPE_LABELS: { [key: string]: string } = {
  ordinary: 'Ordinaria',
  extraordinary: 'Extraordinaria',
  emergency: 'Emergencia',
  informative: 'Informativa',
};

const MEET_TYPE_COLORS: { [key: string]: string } = {
  ordinary: 'blue',
  extraordinary: 'purple',
  emergency: 'red',
  informative: 'cyan',
};

const MeetTable: React.FC<MeetTableProps> = ({
  tableData,
  onEdit,
  onDelete,
  onCreate,
  onView,
  onViewAssistances,
}) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal para nueva reunión
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(!openModal);

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Botón para crear nueva reunión */}
      <div className='flex mb-4 justify-end'>
        <Button onClick={handleOpenModal}>NUEVA REUNIÓN</Button>
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
            {paginatedData.map((meet, index) => {
              const isLast = index === paginatedData.length - 1;
              const classes = isLast
                ? 'p-3'
                : 'p-3 border-b border-blue-gray-50';

              return (
                <tr key={meet.id} className='hover:bg-blue-gray-50/50'>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {meet.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium'
                    >
                      {meet.title}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {formatDateTime(meet.meet_date)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Chip
                      size='sm'
                      value={MEET_TYPE_LABELS[meet.meet_type] || meet.meet_type}
                      color={(MEET_TYPE_COLORS[meet.meet_type] || 'gray') as any}
                    />
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {meet.location || '-'}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Chip
                      size='sm'
                      value={STATUS_LABELS[meet.status] || meet.status}
                      color={(STATUS_COLORS[meet.status] || 'gray') as any}
                    />
                  </td>
                  <td className={classes}>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-normal'
                    >
                      {meet.total_present}/{meet.total_neighbors}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Chip
                      size='sm'
                      value={meet.is_mandatory ? 'Sí' : 'No'}
                      color={meet.is_mandatory ? 'red' : 'blue-gray'}
                    />
                  </td>
                  <td className={classes}>
                    <div className='flex gap-2'>
                      {onViewAssistances && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='purple'
                          onClick={() => onViewAssistances(meet)}
                          title='Ver asistencias'
                        >
                          <UserGroupIcon className='h-4 w-4' />
                        </IconButton>
                      )}
                      {onView && (
                        <IconButton
                          size='sm'
                          variant='text'
                          color='blue'
                          onClick={() => onView(meet)}
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
                          onClick={() => onEdit(meet)}
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
                          onClick={() => onDelete(meet)}
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

      <NewMeetModalForm
        openModalState={openModal}
        handleCloseModal={handleOpenModal}
        onSubmit={(data) => {
          if (onCreate) {
            onCreate(data);
          }
        }}
      />

      {/* Controles de paginación */}
      <div className='flex items-center justify-between border-t border-blue-gray-100 p-4'>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Página {currentPage} de {totalPages} - Total: {sortedData.length}{' '}
          reuniones
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

export default MeetTable;
