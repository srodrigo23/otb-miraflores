import { useState } from 'react';
import { MeasureReadingsHeader } from '../../components/measures/MeasureReadingsHeader';
import CloseMeasureConfirmationModal from '../../components/modals/CloseMeasureConfirmationModal';
import { BackButton } from '../../components/shared/BackButton';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { useGetMeasure } from '../../hooks/measures/useGetMeasure';
import { useMeasureReadings } from '../../hooks/measures/useMeasureReadings';

export const MeterMeasures: React.FC<{measureId:string}> = ({measureId}) => {

  const [openCloseMeasureModal, setOpenCloseMeasureModal] = useState(false);

  const {
    data:dataMeasure,
    isLoading:loadingMeasure,
    refetchMeasure,
    closeMeasure
  } = useGetMeasure(parseInt(measureId));

  const {
    data: meterLectures = [],
    isLoading: loadingMeterLectures,
    createEmptyMeterReadingsByMeasure
  } = useMeasureReadings(parseInt(measureId));

  const handleToggleCloseMeasureModal = () =>
    setOpenCloseMeasureModal((isOpen) => !isOpen);

  const handlerConfirmCloseMeasure = async () => {
    await closeMeasure();
    handleToggleCloseMeasureModal();
  };

  return (
    <>
      <BackButton path={'/mediciones'} />
      {!loadingMeasure ? (
        <MeasureReadingsHeader
          meterReadings={meterLectures}
          measure={dataMeasure}
          handlerCreateEmptyMeterReadings={async ()=>{
            await createEmptyMeterReadingsByMeasure();
            // the backend moved it to IN_PROGRESS: refresh so the button follows
            await refetchMeasure();
          }}
          handlerCloseMeasure={handleToggleCloseMeasureModal}
        />
      ) : (
        <div className='flex justify-center items-center h-64'>
          <LoaderAnimation fullScreen={false} />
        </div>
      )}
      {loadingMeterLectures ? (
        <div className='flex justify-center items-center h-64'>
          <LoaderAnimation fullScreen={false} />
        </div>
      ) : (
        <MeasureReadingsTable readings={meterLectures} />
      )}

      <CloseMeasureConfirmationModal
        openModalState={openCloseMeasureModal}
        handleCloseModal={handleToggleCloseMeasureModal}
        measure={dataMeasure}
        onConfirmClose={handlerConfirmCloseMeasure}
      />
    </>
  );
};
