import { useMemo } from 'react';
import {
  Input,
  List,
  ListItem,
  Typography,
  Chip,
  IconButton,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
interface NeighborListProps {
  neighborsData: NeighborType[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  neighborSelected: NeighborType | null;
  onSelectNeighbor: (neighbor: NeighborType) => void;
}

export const NeighborList: React.FC<NeighborListProps> = ({
  neighborsData,
  searchTerm,
  onSearchChange,
  neighborSelected,
  // onSelectNeighbor,
}) => {

  const navigate = useNavigate()
  const filteredData = useMemo(() => {
    return neighborsData.filter((neighbor) => {
      const fullName =
        `${neighbor.first_name} ${neighbor.second_name} ${neighbor.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLocaleLowerCase());
    });
  }, [searchTerm, neighborsData]);

  return (
    <div className='h-full flex flex-col min-h-0 gap-4 '>
      <div className='flex justify-between'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0'>
          <Typography variant='h2'>Lista General de Vecinos</Typography>
        </div>
        <div className='flex gap-2 flex-shrink-0 justify-end'>
          <Input
            label='Buscar vecino'
            icon={<MagnifyingGlassIcon className='h-5 w-5' />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            crossOrigin={undefined}
          />
          {searchTerm && (
            <IconButton
              variant='gradient'
              color='cyan'
              size='md'
              onClick={() => onSearchChange('')}
            >
              <XMarkIcon className='w-5 h-5' />
            </IconButton>
          )}
          <IconButton
            variant='gradient'
            color='black'
            size='md'
            // onClick={() => onSearchChange('')}
          >
            <UserPlusIcon className='w-5 h-5' />
          </IconButton>
        </div>
      </div>

      {
        // searchTerm && (
        // absolute z-20  w-full mt-1 max-h-60  max-h-screen
        <div className='overflow-y-auto flex-1 min-h-0'>
          {filteredData.length > 0 ? (
            <List className='w-full px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-4'>
              {filteredData.map((neighbor, index) => (
                <ListItem
                  key={`${neighbor.id}-${index}`}
                  className='flex gap-3 bg-blue-gray-50 shadow-lg'
                  selected={neighborSelected?.id === neighbor.id}
                  onClick={() => {
                    navigate(`/vecinos/${neighbor.id}`);
                  }}
                >
                  {/* <span className='border rounded-full '> */}
                  <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md'>
                    {neighbor?.first_name?.[0]}
                    {neighbor?.last_name?.[0]}
                  </div>

                  {/* <UserIcon className='w-5 h-5' /> */}
                  {/* </span> */}
                  <div className='flex flex-1 justify-between w-max'>
                    <div className='flex flex-col'>
                      {/* <span className='text-sm'>{index + 1}</span> */}
                      <Typography variant='small'>
                        {`${neighbor.first_name} ${neighbor.second_name}`}
                      </Typography>
                      <Typography variant='lead' className='font-semibold'>
                        {`${neighbor.last_name}`}
                      </Typography>
                    </div>
                  </div>
                  <Chip value={2} color='yellow' />
                </ListItem>
              ))}
            </List>
          ) : (
            <div className='flex items-center justify-center h-16'>
              <Typography variant='h5'>No existe este nombre</Typography>
            </div>
          )}
        </div>
        // )
      }
    </div>
  );
};
