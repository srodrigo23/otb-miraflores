import { Typography } from '@material-tailwind/react';
import {
  // IdentificationIcon,
  // PhoneIcon,
  // CheckCircleIcon,
  // ChevronRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { NeighborsViewProps } from '../../types/NeighborsTypes';

const getInitials = (n: NeighborType) =>
  `${n.pat_lname?.[0] ?? ''}${n.names?.[0] ?? ''}`.toUpperCase();

export const NeighborList: React.FC<NeighborsViewProps> = ({
  neighbors,
  totalCount,
  searchTerm,
  neighborSelected,
  onSelectNeighbor,
}) => {
  return (
    <div className='min-h-0 flex-1 overflow-y-auto'>
      {neighbors.length > 0 ? (
        <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 md:grid-cols-3 xl:grid-cols-4'>
          {neighbors.map((neighbor) => {
            const isSelected = neighborSelected?.id === neighbor.id;
            // const contact = neighbor.ci
            //   ? { Icon: IdentificationIcon, text: `CI ${neighbor.ci}` }
            //   : neighbor.phone_number
            //     ? { Icon: PhoneIcon, text: String(neighbor.phone_number) }
            //     : null;

            return (
              <li key={neighbor.id}>
                <button
                  type='button'
                  aria-pressed={isSelected}
                  onClick={() => onSelectNeighbor(neighbor)}
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
                      {[neighbor.pat_lname, neighbor.mat_lname]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                    <p className='truncate font-semibold text-blue-gray-900'>
                      {neighbor.names}
                    </p>
                    {/* {contact && (
                        <span className='mt-0.5 flex items-center gap-1 truncate text-xs text-blue-gray-500'>
                          <contact.Icon className='h-3.5 w-3.5 shrink-0' />
                          <span className='truncate'>{contact.text}</span>
                        </span>
                      )} */}
                  </div>

                  {/* {isSelected ? (
                      <CheckCircleIcon className='h-5 w-5 shrink-0 text-blue-500' />
                    ) : (
                      <ChevronRightIcon className='h-5 w-5 shrink-0 text-blue-gray-300' />
                    )} */}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className='flex h-full flex-col items-center justify-center gap-2 py-10 text-center'>
          <UsersIcon className='h-10 w-10 text-blue-gray-300' />
          <Typography variant='h6' className='text-blue-gray-700'>
            {totalCount === 0
              ? 'Aún no hay vecinos registrados'
              : 'Sin resultados'}
          </Typography>
          <Typography variant='small' className='text-blue-gray-500'>
            {totalCount === 0
              ? 'Agrega el primer vecino para comenzar.'
              : `No se encontraron vecinos para “${searchTerm}”.`}
          </Typography>
        </div>
      )}
    </div>
  );
};
