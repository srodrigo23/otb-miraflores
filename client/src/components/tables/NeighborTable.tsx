import { useState, useMemo } from 'react';
import { Typography, Input, 
  // IconButton, Button
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, ChevronUpDownIcon, 
  // PencilIcon, TrashIcon, EyeIcon 
} from '@heroicons/react/24/outline';
import NewNeighborModalForm from '../forms/NewNeighborModalForm';
import { NeighborTableProps } from '../../types/NeighborsTypes';

type SortField = 'id' | 'last_name' | 'first_name' | 'ci' | 'phone_number' | 'email';
type SortOrder = 'asc' | 'desc';

const TABLE_HEAD = [
  { label: 'Num.', field: 'id' as SortField, sortable: true },
  { label: 'Nombre Completo', field: 'Name' as SortField, sortable: true },
  { label: 'Ultimo Consumo', field: 'lastConsumption' as SortField, sortable: true },
  // { label: 'Nombres', field: 'first_name' as SortField, sortable: true },
  // { label: 'CI', field: 'ci' as SortField, sortable: true },
  // { label: 'Celular', field: 'phone_number' as SortField, sortable: true },
  // { label: 'Correo', field: 'email' as SortField, sortable: true },
  // { label: 'Acciones', field: null, sortable: false },
];

const NeighborTable: React.FC<NeighborTableProps> = ({ 
  tableData, 
  // onEdit, 
  // onDelete, 
  onCreate, 
  // onView
 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal para nuevo vecino
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(!openModal);

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    return tableData.filter((neighbor) => {
      const fullName =
        `${neighbor.first_name} ${neighbor.second_name} ${neighbor.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [tableData, searchTerm]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'first_name') {
        aValue = `${a.first_name} ${a.second_name}`;
        bValue = `${b.first_name} ${b.second_name}`;
      }

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
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className='flex flex-col h-screen w-1/2'>
      {/* Campo de búsqueda */}
      <div className='flex justify-between py-3 px-5 flex-shrink-0'>
        {/* <Typography className='text-center mb-2' variant='h3' color='black'>
          Vecinos
        </Typography> */}

        <div className='flex mb-4 justify-center gap-3'>
          <div className='flex w-full md:w-96'>
            <Input
              label='Buscar vecino'
              icon={<MagnifyingGlassIcon className='h-5 w-5' />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              crossOrigin={undefined}
            />
            {/* <div className='flex gap-5 px-10 justify-end'>  </div>*/}
          </div>
          {/* <Button className='' onClick={handleOpenModal}>
            NUEVO VECINO
          </Button> */}
        </div>
      </div>

      {/* Tabla con scroll interno */}
      <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg mx-5'>
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
            {sortedData.map(
              (
                {
                  id,
                  first_name,
                  second_name,
                  last_name,
                  // ci,
                  // phone_number,
                  // email,
                },
                index,
              ) => {
                const isLast = index === sortedData.length - 1;
                const classes = isLast ? '' : 'border-b border-blue-gray-50 py-3';
                
                // const neighbor = {
                //   id,
                //   first_name,
                //   second_name,
                //   last_name,
                //   // ci,
                //   // phone_number,
                //   // email,
                // };

                return (
                  <tr key={id} className='hover:bg-blue-gray-50/50'>
                    <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal text-center'
                      >
                        {id}
                      </Typography>
                    </td>
                    {/* <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal'
                      >
                        {last_name}
                      </Typography>
                    </td> */}
                    <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal'
                      >
                        <a className='cursor-pointer'>
                          {' '}
                          {`${last_name} ${first_name} ${second_name}`}
                        </a>
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal text-center'
                      >
                        0
                      </Typography>
                    </td>
                    {/* <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-medium text-center'
                      >
                        {ci}
                      </Typography>
                    </td> */}
                    {/* <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal text-center'
                      >
                        {phone_number}
                      </Typography>
                    </td> */}
                    {/* <td className={classes}>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-normal'
                      >
                        {email}
                      </Typography>
                    </td> */}
                    {/* <td className={classes}>
                      <div className='flex gap-2 justify-center'>
                        {onView && (
                          <IconButton
                            size='sm'
                            variant='text'
                            color='blue'
                            onClick={() => onView(neighbor)}
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
                            onClick={() => onEdit(neighbor)}
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
                            onClick={() => onDelete(neighbor)}
                            title='Eliminar'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </IconButton>
                        )}
                      </div>
                    </td> */}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <NewNeighborModalForm
        openModalState={openModal}
        handleCloseModal={handleOpenModal}
        onSubmit={(data) => {
          if (onCreate) {
            onCreate(data);
          }
        }}
      />

      <div className='flex items-center justify-between border-t border-blue-gray-100 p-4 flex-shrink-0'>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Total: {filteredData.length} vecinos
        </Typography>
      </div>
    </div>
  );
};

export default NeighborTable;
