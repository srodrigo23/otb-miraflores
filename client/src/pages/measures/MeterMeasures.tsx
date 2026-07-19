import { MeasureReadingsHeader } from '../../components/measures/MeasureReadingsHeader';
import { BackButton } from '../../components/shared/BackButton';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { useGetMeasure } from '../../hooks/measures/useGetMeasure';
// import { useMeasureReadings } from '../../hooks/measures/useMeasureReadings';

export const MeterMeasures: React.FC<{measureId:string}> = ({measureId}) => {

  // const { 
  //   data: meterLectures = [], 
  //   isLoading: loadingMeterLectures
  // } = useMeasureReadings(parseInt(measureId));

  const { data, isLoading:loadingMeasure } = useGetMeasure(parseInt(measureId));

  return (
    <>
      <BackButton path={'/mediciones'} />
      {!loadingMeasure ? (
        <MeasureReadingsHeader meterReadings={[]} measure={data} />
      ) : (
        <div className='flex justify-center items-center h-64'>
          <LoaderAnimation fullScreen={false} />
        </div>
      )}
      <MeasureReadingsTable readings={[]} />
    </>
  );
};
