import { useState } from 'react';

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
import { Button } from '@material-tailwind/react';
import { BackButton } from '../../components/shared/BackButton';
import { useSearchParams } from 'react-router-dom';
import { MeasureReadings } from '../../components/measures/MeasureReadings';

const Measures = () => {

  const [searchParams] = useSearchParams();
  const measureId = searchParams.get('id');

  const {
    data: measuresData = [],
    isLoading: loadingMeasuresData,
    refetchMeasures,
  } = useMeasuresData();

  const [openNewMeasureModal, setOpenNewMeasureModal] = useState(false);
  const handleOpenModal = () => setOpenNewMeasureModal(!openNewMeasureModal);
  
  const [openDeleteMeasureModal, setDeleteMeasureModal] = useState(false);
  const handleOpenDeleteMeasureModal = () =>
    setDeleteMeasureModal(!openDeleteMeasureModal);
  
  const [measureToDelete, setMeasureToDelete] = useState<MeasureType|null>(null);

  const {
    createNewMeasure,
    isLoading: loadingMeasureCreated,
  } = useNewMeasure();

  const { deleteMeasure } = useDeleteMeasure();
  
  /**
   * Open modal to confirm measure deletion
   * @param measure 
   */
  const handleDeleteWithModal = (measure:MeasureType)=>{
    setMeasureToDelete(measure);
    handleOpenDeleteMeasureModal();
  };

  /**
   * Delete measure and  
   */
  const handlerDeleteMeasure = async() => {
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
      ) : measureId !== null ? (
        <>
          <BackButton path={'/mediciones'} />
          <MeasureReadings measureId={parseInt(measureId)} />
        </>
      ) : (
        <div className='w-full flex flex-col gap-6 h-full py-4 px-3 lg:px-3'>
          <div className='flex flex-col sm:flex-row justify-between gap-3 py-3 items-center border rounded-lg p-5'>
            <DetailCardsMeasures measures={measuresData} />
            <Button
              className='w-60 h-fit'
              onClick={handleOpenModal}
              disabled={loadingMeasuresData && loadingMeasureCreated}
            >
              NUEVA MEDICIÓN
            </Button>
          </div>
          <MeasureTable
            tableData={measuresData}
            onDelete={handleDeleteWithModal}
          />
        </div>
      )}

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
  );
};

export default Measures;
