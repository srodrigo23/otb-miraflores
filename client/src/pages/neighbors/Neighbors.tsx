import { useState } from 'react';
import {
  Typography,
  // Button,
  // IconButton,
} from '@material-tailwind/react';

import { useNeighborsData } from '../../hooks/useNeighborsData';
import { EditNeighborInfoForm } from '../../components/forms/EditNeighborInfoForm';
import { NeighborList } from '../../components/lists/NeighborsList';
import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { NeighborType } from '../../interfaces/neighborsInterfaces';



const Neighbors = () => {

  const { data: neighborsData = [], isLoading: loading, 
    // refetch 
  } = useNeighborsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborType | null>(null);

  return (
    <>
      {loading ? (
        <LoaderAnimation isLoading={loading} />
      ) : (
        <div className='mx-auto container w-full flex flex-col gap-6 h-full py-4 px-3 lg:px-3'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0'>
            <Typography variant='h2'>Detalle General de Vecinos</Typography>
          </div>
          <div className='flex flex-row gap-3 flex-1 min-h-0'>
            <NeighborList
              neighborsData={neighborsData}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              neighborSelected={selectedNeighbor}
              onSelectNeighbor={setSelectedNeighbor}
            />

            <div className='flex flex-col gap-4 lg:flex-1 lg:overflow-y-auto lg:min-h-0'>
              <div className='flex justify-center flex-shrink-0'>
                <EditNeighborInfoForm />
              </div>

              <div className='border rounded-xl lg:flex-1 lg:min-h-0'>
                <NeighborDebtsPayments />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Neighbors;
