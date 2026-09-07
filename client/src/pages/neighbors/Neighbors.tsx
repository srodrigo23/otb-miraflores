import { useMemo, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconButton, Input, Typography } from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { useNeighborsData } from '../../hooks/neighbors/useNeighborsData';
import { NeighborList } from '../../components/neighbors/NeighborsList';
import NeighborTable from '../../components/tables/NeighborTable';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { NeighborDetails } from '../../components/neighbors/NeighborDetails';
import { BackButton } from '../../components/shared/BackButton';
import { ViewSwitch } from '../../components/shared/ViewSwitch';
import { ViewMode } from '../../types/commonTypes';
import { filterNeighbors } from '../../utils/neighbors';

const Neighbors = () => {
  const navigate = useNavigate();
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

  // Filtering lives here, not in the views: both answered the same search the
  // same way, and the header count has to match whatever is rendered below.
  const filteredNeighbors = useMemo(
    () => filterNeighbors(neighborsData, searchTerm),
    [neighborsData, searchTerm],
  );

  // Not wired yet — the register is still populated by the seed scripts.
  const onAddNeighbor: (() => void) | undefined = undefined;

  const handleSelect = (neighbor: NeighborType) => {
    navigate(`/vecinos?id=${neighbor.id}`);
    setSelectedNeighbor(neighbor);
  };

  // Both views take the same props, so switching only swaps the component —
  // the search term and the selection carry across untouched.
  const viewProps = {
    neighbors: filteredNeighbors,
    totalCount: neighborsData.length,
    searchTerm,
    neighborSelected: selectedNeighbor,
    onSelectNeighbor: handleSelect,
  };

  if (loading) return <LoaderAnimation />;

  if (neighborId !== null) {
    return (
      <>
        <BackButton path='/vecinos' />
        <NeighborDetails
          neighborId={selectedNeighbor?.id || parseInt(neighborId)}
          refetchNeighbors={refetchNeighbors}
        />
      </>
    );
  }

  return (
    <div className='flex h-full min-h-0 flex-col gap-4'>
      {/* Header: title + live count + actions. Shared by both views, so the
          switch doesn't shift the layout when the view changes. */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-baseline gap-2'>
          <Typography variant='h3' className='text-blue-gray-900'>
            Vecinos
          </Typography>
          <span className='rounded-full bg-blue-gray-100 px-2 py-0.5 text-xs font-semibold text-blue-gray-700'>
            {filteredNeighbors.length}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative flex-1 sm:w-64'>
            <Input
              label='Buscar por nombre, CI o teléfono'
              icon={<MagnifyingGlassIcon className='h-5 w-5' />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              crossOrigin={undefined}
            />
            {searchTerm && (
              <button
                type='button'
                onClick={() => setSearchTerm('')}
                aria-label='Limpiar búsqueda'
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-blue-gray-500 transition-colors hover:bg-blue-gray-100 hover:text-blue-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              >
                <XMarkIcon className='h-4 w-4' />
              </button>
            )}
          </div>

          <ViewSwitch value={viewMode} onChange={setViewMode} />

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

      {viewMode === 'table' ? (
        <NeighborTable {...viewProps} />
      ) : (
        <NeighborList {...viewProps} />
      )}
    </div>
  );
};
export default Neighbors;
