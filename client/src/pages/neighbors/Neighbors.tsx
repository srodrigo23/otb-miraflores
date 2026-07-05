import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';
import { useNeighborsData } from '../../hooks/useNeighborsData';
import { NeighborList } from '../../components/neighbors/NeighborsList';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { NeighborDetails } from '../../components/neighbors/NeighborDetails';

const Neighbors = () => {
  const [searchParams] = useSearchParams();
  const neighborId = searchParams.get('id');
  const navigate = useNavigate();

  const {
    data: neighborsData = [],
    isLoading: loading,
    refetch: refetchNeighbors,
  } = useNeighborsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborType | null>(
    null,
  );

  return (
    <>
      {loading ? (
        <LoaderAnimation />
      ) : neighborId !== null ? (
        <>
          <span
            className='text-gray-500 cursor-pointer underline'
            onClick={() => navigate('/vecinos')}
          >
            {' '}
            {'Atrás'}
          </span>
          <NeighborDetails
            neighborId={selectedNeighbor?.id || parseInt(neighborId)}
            refetchNeighbors={refetchNeighbors}
          />
        </>
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
