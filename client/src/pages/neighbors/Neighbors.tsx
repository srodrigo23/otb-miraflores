import { useState } from 'react';
// import {
//   Typography,
//   // Button,
//   // IconButton,
// } from '@material-tailwind/react';

import { useNeighborsData } from '../../hooks/useNeighborsData';
// import { EditNeighborInfoForm } from '../../components/forms/EditNeighborInfoForm';
import { NeighborList } from '../../components/lists/NeighborsList';
// import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';
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
        <div className='mx-auto container w-full flex flex-col gap-6 h-full py-7 px-3 lg:px-3'>
          
          {/* <div className='flex flex-row gap-3 flex-1 min-h-0'> */}
          <NeighborList
            neighborsData={neighborsData}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            neighborSelected={selectedNeighbor}
            onSelectNeighbor={setSelectedNeighbor}
          />
          {/* </div> */}
        </div>
      )}
    </>
  );
};
export default Neighbors;
