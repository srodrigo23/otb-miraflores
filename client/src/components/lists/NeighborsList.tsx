import { useMemo } from "react";
import { Input, List, ListItem, Typography, Chip, IconButton } from "@material-tailwind/react";
import { MagnifyingGlassIcon, XMarkIcon} from "@heroicons/react/24/outline";
import { NeighborType } from "../../interfaces/neighborsInterfaces";
import { UserPlusIcon, UserIcon } from '@heroicons/react/24/outline';

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

  const filteredData = useMemo(() => {
    return neighborsData.filter((neighbor) => {
      const fullName = `${neighbor.first_name} ${neighbor.second_name} ${neighbor.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLocaleLowerCase())
    })
  }, [searchTerm, neighborsData])

  return (
    <div className='h-full flex flex-col min-h-0'>
      <div className='flex gap-2 flex-shrink-0'>
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

      {
        // searchTerm && (
        // absolute z-20  w-full mt-1 max-h-60  max-h-screen
        <div className='overflow-y-auto flex-1 min-h-0'>
          
          {
          filteredData.length > 0 ? (
            <List className='w-full px-0 '>
              {filteredData.map((neighbor, index) => (
                <ListItem
                  key={`${neighbor.id}-${index}`}
                  className='flex gap-3 bg-blue-gray-50 '
                  selected={neighborSelected?.id === neighbor.id}
                  // onClick={() => {
                  //   onSearchChange('');
                  //   onSelectNeighbor(neighbor);
                  // }}
                >
                  <span className='border rounded-full p-2 bg-blue-gray-200'>
                    <UserIcon className='w-5 h-5' />
                  </span>
                  <div className='flex flex-1 justify-between w-max'>
                    <p className='flex flex-col'>
                      {/* <span className='text-sm'>{index + 1}</span> */}
                      <Typography variant='lead' className='font-semibold'>
                        {`${neighbor.last_name}`}
                      </Typography>
                      <Typography variant='small'>
                        {`${neighbor.first_name} ${neighbor.second_name}`}
                      </Typography>
                    </p>
                    <Chip value={123} color='blue' />
                  </div>
                </ListItem>
              ))}
            </List>
          ) : (
            <div className='flex items-center justify-center h-16'>
              <Typography variant='h5'>No existe este nombre</Typography>
            </div>
          )
          }
        </div>
        // )
      }
    </div>
  );
};
