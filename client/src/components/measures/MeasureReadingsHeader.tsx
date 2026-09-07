import { Button, Chip, Typography } from '@material-tailwind/react';
import { PlayIcon, PrinterIcon, StopIcon } from '@heroicons/react/24/outline';
import { DetailCardsReadings } from './DetailCardsReadings';
import {
  MeasureType,
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';
import { LoaderAnimation } from '../shared/LoaderAnimation';
import { MetaField } from '../shared/MetaField';
import { formatDate } from '../../utils/dates';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants';
import { color } from '../../types/commonTypes';

export const MeasureReadingsHeader: React.FC<{
  measure: MeasureType | undefined;
  isLoadingMeasure?: boolean;
  meterReadings: MeterReadingType[] | [];
  isLoadingMeterReadings?: boolean;
  handlerCreateEmptyMeterReadings: () => void;
  handlerCloseMeasure: () => void;
  handlerPrintReadingsSheet: () => void;
  isPreparingSheet?: boolean;
}> = ({
  measure,
  meterReadings,
  isLoadingMeasure,
  isLoadingMeterReadings,
  handlerCreateEmptyMeterReadings,
  handlerCloseMeasure,
  handlerPrintReadingsSheet,
  isPreparingSheet = false,
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
      <DetailCardsReadings meterReadings={meterReadings}/>
      <div className='flex shrink-0 flex-row justify-between rounded-lg'>
        {!isLoadingMeasure && !isLoadingMeterReadings ? (
          // Stacks below sm — the four facts and the two actions never fit on
          // one phone-width row — and lines up again from sm on.
          <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            {
              measure && (
                <div className='grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6'>
                  <MetaField label='Fecha'>
                    <Typography variant='small' color='blue-gray' className='font-bold'>
                      {formatDate(measure.measure_date)}
                    </Typography>
                  </MetaField>
                  <MetaField label='Periodo'>
                    <span className='w-fit px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-sm font-semibold'>
                      {measure.period}
                    </span>
                  </MetaField>
                  <MetaField label='Estado'>
                    <Chip
                      className='w-fit'
                      size='sm'
                      value={STATUS_LABELS[measure.status] || measure.status}
                      color={(STATUS_COLORS[measure.status] || 'gray') as color}
                    />
                  </MetaField>
                  <MetaField label='Responsable'>
                    <Typography variant='small' color='blue-gray' className='truncate font-bold'>
                      {measure.reader_name}
                    </Typography>
                  </MetaField>
                </div>
              )
            }

            <div className='flex shrink-0 flex-row gap-2 sm:gap-3'>
              <Button
                variant='gradient'
                color={isCreated ? 'blue' : isClosed ? 'green' : 'red'}
                className='flex h-fit flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 text-xs sm:flex-none sm:px-4 sm:text-sm'
                disabled={isClosed}
                onClick={handlerFillOutReadings}
              >
                {isCreated ? (
                  <PlayIcon className='w-5 h-5 shrink-0' />
                ) : (
                  <StopIcon className='w-5 h-5 shrink-0' />
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
                className='flex h-fit shrink-0 items-center justify-center px-3 sm:px-4'
                onClick={handlerPrintReadingsSheet}
                // Nothing to hand the reader before the readings exist
                disabled={isCreated || isPreparingSheet}
                title='Imprimir planilla'
              >
                <PrinterIcon className='w-5 h-5' />
                {isPreparingSheet ? 'Generando...' : 'Imprimir Tabla'}
              </Button>
            </div>
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
