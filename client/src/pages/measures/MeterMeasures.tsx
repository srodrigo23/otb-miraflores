import { MeasureReadingsHeader } from '../../components/measures/MeasureReadingsHeader';
import { BackButton } from '../../components/shared/BackButton';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { useGetMeasure } from '../../hooks/measures/useGetMeasure';
import { useMeasureReadings } from '../../hooks/measures/useMeasureReadings';
// import { useMeasureReadings } from '../../hooks/measures/useMeasureReadings';

export const MeterMeasures: React.FC<{measureId:string}> = ({measureId}) => {

  
  
  const { data:dataMeasure, isLoading:loadingMeasure } = useGetMeasure(parseInt(measureId));
  
  const {
    data: meterLectures = [], 
    isLoading: loadingMeterLectures, 
    createEmptyMeterReadingsByMeasure
  } = useMeasureReadings(parseInt(measureId));

  return (
    <>
      <BackButton path={'/mediciones'} />
      {!loadingMeasure ? (
        <MeasureReadingsHeader
          meterReadings={meterLectures}
          measure={dataMeasure}
          handlerCreateEmptyMeterReadings={()=>{
            createEmptyMeterReadingsByMeasure();
          }}
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
    </>
  );
};
