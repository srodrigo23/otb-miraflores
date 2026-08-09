import { useState } from 'react';
import { toast } from 'react-toastify';

import { MeasureReadingsHeader } from '../../components/measures/MeasureReadingsHeader';
import CloseMeasureConfirmationModal from '../../components/modals/CloseMeasureConfirmationModal';
import { BackButton } from '../../components/shared/BackButton';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { useGetMeasure } from '../../hooks/measures/useGetMeasure';
import { useMeasureReadings } from '../../hooks/measures/useMeasureReadings';
import { MeterReadingsSheet } from '../../reports/MeterReadingsSheet';
import { openReport, reportFileName } from '../../reports/openReport';

export const MeterMeasures: React.FC<{measureId:string}> = ({measureId}) => {

  const [openCloseMeasureModal, setOpenCloseMeasureModal] = useState(false);
  const [isPreparingSheet, setIsPreparingSheet] = useState(false);

  const {
    data:dataMeasure,
    isLoading:loadingMeasure,
    refetchMeasure,
    closeMeasure
  } = useGetMeasure(parseInt(measureId));

  const {
    data: meterLectures = [],
    isLoading: loadingMeterLectures,
    createEmptyMeterReadingsByMeasure,
    updateMeterReading,
    fetchMeterReadings
  } = useMeasureReadings(parseInt(measureId));

  const handleToggleCloseMeasureModal = () =>
    setOpenCloseMeasureModal((isOpen) => !isOpen);

  const handlerConfirmCloseMeasure = async () => {
    await closeMeasure();
    handleToggleCloseMeasureModal();
  };

  /**
   * Reads the list again before printing: the sheet goes out on paper, so it
   * must not carry a value another collector changed a minute ago.
   */
  const handlerPrintReadingsSheet = async () => {
    if (isPreparingSheet) return;
    setIsPreparingSheet(true);
    try {
      const readings = await fetchMeterReadings();
      if (readings.length === 0) {
        toast.warning('No hay lecturas para imprimir en esta medición');
        return;
      }
      await openReport(
        <MeterReadingsSheet measure={dataMeasure} readings={readings} />,
        reportFileName(['planilla-lecturacion', dataMeasure?.period]),
      );
    } catch {
      toast.error('No se pudo generar la planilla');
    } finally {
      setIsPreparingSheet(false);
    }
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
          handlerPrintReadingsSheet={handlerPrintReadingsSheet}
          isPreparingSheet={isPreparingSheet}
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
        <MeasureReadingsTable
          readings={meterLectures}
          onSaveReading={updateMeterReading}
          isReadOnly={dataMeasure?.status === 'CLOSED'}
        />
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
