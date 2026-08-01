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
  handlerCloseMeasure: () => void;
}> = ({
  measure,
  meterReadings,
  isLoadingMeasure,
  isLoadingMeterReadings,
  handlerCreateEmptyMeterReadings,
  handlerCloseMeasure,
}) => {
  const statusMeasure = measure?.status;
  const isCreated = statusMeasure === 'CREATED';
  const isClosed = statusMeasure === 'CLOSED';

  const handlerFillOutReadings = () => {
    if (isCreated) {
      handlerCreateEmptyMeterReadings();
      return;
    }
    if (statusMeasure === 'IN_PROGRESS') {
      handlerCloseMeasure();
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
              color={isCreated ? 'blue' : isClosed ? 'green' : 'red'}
              className='flex items-center justify-center gap-2 h-fit'
              disabled={isClosed}
              onClick={handlerFillOutReadings}
            >
              {isCreated ? (
                <PlayIcon className='w-4 h-4' />
              ) : (
                <StopIcon className='w-4 h-4' />
              )}
              {isCreated
                ? 'Iniciar Llenado'
                : isClosed
                  ? 'Llenado Cerrado'
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
