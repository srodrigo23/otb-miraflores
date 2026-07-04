import { useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import { useNeighborsData } from '../../hooks/useNeighborsData';
import { NeighborList } from '../../components/lists/NeighborsList';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { NeighborDetails } from './NeighborDetails';


const Neighbors = () => {
  const [ searchParams ] = useSearchParams();
  const neighborId = searchParams.get('id');
  
  const { data: neighborsData = [], isLoading: loading, refetch: refetchNeighbors } = useNeighborsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborType | null>(
    null,
  );

  return (
    <>
      {loading ? (
        <LoaderAnimation/>
      ) : neighborId !== null ? (
        <NeighborDetails
          neighborId={selectedNeighbor?.id || parseInt(neighborId)}
          refetchNeighbors={refetchNeighbors}
        />
      ) : (
        <NeighborList
          neighborsData={neighborsData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          neighborSelected={selectedNeighbor}
          onSelectNeighbor={setSelectedNeighbor}
        />
      )}
    </>
  );
};
export default Neighbors;
