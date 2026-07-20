import { Button } from '@material-tailwind/react';
import { PlayIcon, PrinterIcon, StopIcon } from '@heroicons/react/24/outline';
import { DetailCardsReadings } from './DetailCardsReadings';
import {
  MeasureType,
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';
import { LoaderAnimation } from '../shared/LoaderAnimation';

export const MeasureReadingsHeader: React.FC<{
  measure: MeasureType | undefined;
  isLoadingMeasure?: boolean;
  meterReadings: MeterReadingType[] | [];
  isLoadingMeterReadings?: boolean;
  handlerCreateEmptyMeterReadings: () => void;
}> = ({
  measure,
  meterReadings,
  isLoadingMeasure,
  isLoadingMeterReadings,
  handlerCreateEmptyMeterReadings,
}) => {
  const statusMeasure = measure?.status;

  const handlerFillOutReadings = () => {
    if (statusMeasure === 'CREATED') {
      handlerCreateEmptyMeterReadings();
    }
  };

  return (
    <>
      <div className='flex flex-col sm:flex-row justify-between gap-3 py-3 items-center border rounded-lg p-5'>
        <DetailCardsReadings meterReadings={meterReadings} measure={measure} />
        {!isLoadingMeasure && !isLoadingMeterReadings ? (
          <div className='flex flex-row sm:flex-col gap-2 w-full sm:w-auto'>
            <Button
              variant='gradient'
              color={measure?.status === 'CREATED' ? 'blue' : 'red'}
              className='flex items-center justify-center gap-2 h-fit'
              onClick={handlerFillOutReadings}
            >
              {measure?.status === 'CREATED' ? (
                <PlayIcon className='w-4 h-4' />
              ) : (
                <StopIcon className='w-4 h-4' />
              )}
              {measure?.status === 'CREATED'
                ? 'Iniciar Llenado'
                : 'Cerrar Llenado'}
            </Button>
            <Button
              variant='outlined'
              color='blue-gray'
              className='flex items-center justify-center gap-2 h-fit'
            >
              <PrinterIcon className='w-4 h-4' />
              Imprimir Tabla
            </Button>
          </div>
        ) : (
          <>
            <LoaderAnimation fullScreen={false} />
          </>
        )}
      </div>
    </>
  );
};
