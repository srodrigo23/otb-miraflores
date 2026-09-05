import { useEffect, useRef, useState } from 'react';

import NewMeasureModalForm from '../../components/forms/NewMeasureModalForm';

import { useMeasuresData } from '../../hooks/measures/useMeasuresData';
import useNewMeasure from '../../hooks/measures/useNewMeasure';
import MeasureTable from '../../components/tables/MeasureTable';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { MeasureType } from '../../interfaces/measuresIterfaces';
import { InputsNewMeasureForm } from '../../types/MeasuresTypes';
import useDeleteMeasure from '../../hooks/measures/useDeleteMeasure';
import DeleteMeasureConfirmationModal from '../../components/modals/DeleteMeasureConfirmationModal';
import { DetailCardsMeasures } from '../../components/measures/DetailCardsMeasures';
import { Button, Typography } from '@material-tailwind/react';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';
import { MeterMeasures } from './MeterMeasures';

const Measures = () => {
  const [searchParams] = useSearchParams();
  const measureId = searchParams.get('id');

  const {
    data: measuresData = [],
    isLoading: loadingMeasuresData,
    refetchMeasures,
  } = useMeasuresData();

  // The detail view is not a separate route: it is this same component rendering
  // MeterMeasures when the `id` param is present. Going back only drops the param,
  // so nothing remounts and useMeasuresData never fetches again — the list would
  // keep the status the measures had before entering the detail.
  const isDetailView = measureId !== null;
  const wasDetailView = useRef(false);

  useEffect(() => {
    // Only when coming back from the detail, where the status may have changed
    // (starting the fill moves it to IN_PROGRESS, closing it to CLOSED).
    // The ref keeps the initial render from firing a second, redundant fetch.
    if (wasDetailView.current && !isDetailView) {
      refetchMeasures();
    }
    wasDetailView.current = isDetailView;
  }, [isDetailView]);

  const [openNewMeasureModal, setOpenNewMeasureModal] = useState(false);
  const handleOpenModal = () => setOpenNewMeasureModal(!openNewMeasureModal);

  const [openDeleteMeasureModal, setDeleteMeasureModal] = useState(false);
  const handleOpenDeleteMeasureModal = () =>
    setDeleteMeasureModal(!openDeleteMeasureModal);

  const [measureToDelete, setMeasureToDelete] = useState<MeasureType | null>(
    null,
  );

  const { createNewMeasure} =
    useNewMeasure();

  const { deleteMeasure } = useDeleteMeasure();

  /**
   * Open modal to confirm measure deletion
   * @param measure
   */
  const handleDeleteWithModal = (measure: MeasureType) => {
    setMeasureToDelete(measure);
    handleOpenDeleteMeasureModal();
  };

  /**
   * Delete measure and
   */
  const handlerDeleteMeasure = async () => {
    await deleteMeasure(measureToDelete);
    refetchMeasures();
    setMeasureToDelete(null);
    handleOpenDeleteMeasureModal();
  };

  const handlerNewMeasure = async (data: InputsNewMeasureForm) => {
    await createNewMeasure(data);
    refetchMeasures();
  };

  return (
    <>
      {loadingMeasuresData ? (
        <LoaderAnimation />
      ) : (
        <div className='w-full flex flex-col gap-3 h-full px-3 lg:px-3'>
          {measureId !== null ? (
            <MeterMeasures measureId={measureId} />
          ) : (
            <>
              <div className='flex justify-between gap-3'>
                  <Typography variant='h5' className='text-blue-gray-900 items-center'>
                    Mediciones
                  </Typography>
                  {/* <span className='rounded-full bg-blue-gray-100 px-2 py-0.5 text-xs font-semibold text-blue-gray-700'>
                          {filteredData.length}
                        </span> */}
                  <Button
                    variant='gradient'
                    color='blue'
                    className='flex h-fit shrink-0 items-center justify-center gap-2'
                    onClick={handleOpenModal}
                    // disabled={loadingMeasureCreated}
                  >
                    <DocumentPlusIcon className='h-4 w-4' />
                    NUEVA MEDICIÓN
                  </Button>
                
              </div>

              <DetailCardsMeasures measures={measuresData} />

              <MeasureTable
                tableData={measuresData}
                onDelete={handleDeleteWithModal}
              />
              <NewMeasureModalForm
                openModalState={openNewMeasureModal}
                handleCloseModal={handleOpenModal}
                onSubmit={handlerNewMeasure}
              />

              <DeleteMeasureConfirmationModal
                openModalState={openDeleteMeasureModal}
                handleCloseModal={handleOpenDeleteMeasureModal}
                measure={measureToDelete}
                onConfirmDelete={handlerDeleteMeasure}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Measures;
