import { MeasureReadingsHeader } from '../../components/measures/MeasureReadingsHeader';
import { BackButton } from '../../components/shared/BackButton';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { useGetMeasure } from '../../hooks/measures/useGetMeasure';

export const MeterMeasures: React.FC<{measureId:string}> = ({measureId}) => {

  // const { 
  //   data: meterLectures = [], 
  //   isLoading: loadingMeterLectures
  // } = useMeasureReadings(parseInt(measureId));

  const { data } = useGetMeasure(parseInt(measureId));

  return (
    <>
      <BackButton path={'/mediciones'} />

      <MeasureReadingsHeader meterReadings={[]} measure={data} />
      <MeasureReadingsTable readings={[]} />

    </>
  );
};
