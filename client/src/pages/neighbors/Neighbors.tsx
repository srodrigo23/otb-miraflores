import { useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import { useNeighborsData } from '../../hooks/neighbors/useNeighborsData';
import { NeighborList } from '../../components/neighbors/NeighborsList';
import NeighborTable from '../../components/tables/NeighborTable';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { NeighborDetails } from '../../components/neighbors/NeighborDetails';
import { BackButton } from '../../components/shared/BackButton';
import { ViewSwitch } from '../../components/shared/ViewSwitch';
import { ViewMode } from '../../types/commonTypes';

const Neighbors = () => {
  const [searchParams] = useSearchParams();
  const neighborId = searchParams.get('id');
  const {
    data: neighborsData = [],
    isLoading: loading,
    refetch: refetchNeighbors,
  } = useNeighborsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborType | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Both views take the same props, so switching only swaps the component —
  // the search term and the selection carry across untouched.
  const viewProps = {
    neighborsData,
    searchTerm,
    onSearchChange: setSearchTerm,
    neighborSelected: selectedNeighbor,
    onSelectNeighbor: setSelectedNeighbor,
    headerActions: <ViewSwitch value={viewMode} onChange={setViewMode} />,
  };

  return (
    <>
      {loading ? (
        <LoaderAnimation />
      ) : neighborId !== null ? (
        <>
          <BackButton path='/vecinos'/>
          <NeighborDetails
            neighborId={selectedNeighbor?.id || parseInt(neighborId)}
            refetchNeighbors={refetchNeighbors}
          />
        </>
      ) : viewMode === 'table' ? (
        <NeighborTable {...viewProps} />
      ) : (
        <NeighborList {...viewProps} />
      )}
    </>
  );
};
export default Neighbors;
