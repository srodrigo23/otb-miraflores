import { useMemo } from 'react';
import { Input, Typography, IconButton } from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserPlusIcon,
  IdentificationIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { useNavigate } from 'react-router-dom';

interface NeighborListProps {
  neighborsData: NeighborType[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  neighborSelected: NeighborType | null;
  onSelectNeighbor: (neighbor: NeighborType) => void;
  /** Optional — wire this from the parent to enable the "add neighbor" action. */
  onAddNeighbor?: () => void;
}

const getInitials = (n: NeighborType) =>
  `${n.first_name?.[0] ?? ''}${n.last_name?.[0] ?? ''}`.toUpperCase();

export const NeighborList: React.FC<NeighborListProps> = ({
  neighborsData,
  searchTerm,
  onSearchChange,
  neighborSelected,
  onSelectNeighbor,
  onAddNeighbor,
}) => {
  const navigate = useNavigate();

  const query = searchTerm.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!query) return neighborsData;
    return neighborsData.filter((neighbor) => {
      const haystack = [
        neighbor.first_name,
        neighbor.second_name,
        neighbor.last_name,
        neighbor.ci,
        neighbor.phone_number,
        neighbor.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [query, neighborsData]);

  const handleSelect = (neighbor: NeighborType) => {
    navigate(`/vecinos?id=${neighbor.id}`);
    onSelectNeighbor(neighbor);
  };

  return (
    <div className='flex h-full min-h-0 flex-col gap-4'>
      {/* Header: title + live count + actions */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-baseline gap-2'>
          <Typography variant='h5' className='text-blue-gray-900'>
            Vecinos
          </Typography>
          <span className='rounded-full bg-blue-gray-100 px-2 py-0.5 text-xs font-semibold text-blue-gray-700'>
            {filteredData.length}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative flex-1 sm:w-64'>
            <Input
              label='Buscar por nombre, CI o teléfono'
              icon={<MagnifyingGlassIcon className='h-5 w-5' />}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              crossOrigin={undefined}
            />
            {searchTerm && (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                aria-label='Limpiar búsqueda'
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-blue-gray-500 transition-colors hover:bg-blue-gray-100 hover:text-blue-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              >
                <XMarkIcon className='h-4 w-4' />
              </button>
            )}
          </div>

          <IconButton
            variant='gradient'
            color='blue'
            size='md'
            onClick={onAddNeighbor}
            disabled={!onAddNeighbor}
            aria-label='Agregar vecino'
            className='shrink-0'
          >
            <UserPlusIcon className='h-5 w-5' />
          </IconButton>
        </div>
      </div>

      {/* List */}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {filteredData.length > 0 ? (
          <ul className='grid grid-cols-1 gap-3 py-1 md:grid-cols-2 xl:grid-cols-3'>
            {filteredData.map((neighbor) => {
              const isSelected = neighborSelected?.id === neighbor.id;
              const contact = neighbor.ci
                ? { Icon: IdentificationIcon, text: `CI ${neighbor.ci}` }
                : neighbor.phone_number
                  ? { Icon: PhoneIcon, text: String(neighbor.phone_number) }
                  : null;

              return (
                <li key={neighbor.id}>
                  <button
                    type='button'
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(neighbor)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-blue-gray-100 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-base font-bold text-white shadow-md'
                      aria-hidden='true'
                    >
                      {getInitials(neighbor)}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm text-blue-gray-600'>
                        {[neighbor.first_name, neighbor.second_name]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                      <p className='truncate font-semibold text-blue-gray-900'>
                        {neighbor.last_name}
                      </p>
                      {contact && (
                        <span className='mt-0.5 flex items-center gap-1 truncate text-xs text-blue-gray-500'>
                          <contact.Icon className='h-3.5 w-3.5 shrink-0' />
                          <span className='truncate'>{contact.text}</span>
                        </span>
                      )}
                    </div>

                    {isSelected ? (
                      <CheckCircleIcon className='h-5 w-5 shrink-0 text-blue-500' />
                    ) : (
                      <ChevronRightIcon className='h-5 w-5 shrink-0 text-blue-gray-300' />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-2 py-10 text-center'>
            <UsersIcon className='h-10 w-10 text-blue-gray-300' />
            <Typography variant='h6' className='text-blue-gray-700'>
              {neighborsData.length === 0
                ? 'Aún no hay vecinos registrados'
                : 'Sin resultados'}
            </Typography>
            <Typography variant='small' className='text-blue-gray-500'>
              {neighborsData.length === 0
                ? 'Agrega el primer vecino para comenzar.'
                : `No se encontraron vecinos para “${searchTerm}”.`}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
