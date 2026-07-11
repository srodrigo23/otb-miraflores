
import { Card, CardBody, Chip, Typography } from '@material-tailwind/react';

import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { MeasureType, MeterReadingType } from '../../interfaces/measuresIterfaces';
import { color } from '../../types/commonTypes';

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'green',
  IN_PROGRESS: 'blue',
  CLOSED: 'red',
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Creada',
  IN_PROGRESS: 'En Progreso',
  CLOSED: 'Cerrada',
};

export const DetailCardsReadings: React.FC<{
  meterReadings: MeterReadingType[] | [],
  measure: MeasureType | undefined }> = ({ meterReadings, measure}) => {
  return (
    <div className='flex flex-col gap-3 w-full'>
      {measure && (
        <div className='flex flex-wrap items-center gap-4 px-1'>
          <div className='flex items-center gap-2'>
            <Typography variant='small' color='blue-gray' className='font-medium'>
              Periodo:
            </Typography>
            <span className='px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-sm font-semibold'>
              {measure.period}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Typography variant='small' color='blue-gray' className='font-medium'>
              Estado:
            </Typography>
            <Chip
              size='sm'
              value={STATUS_LABELS[measure.status] || measure.status}
              color={(STATUS_COLORS[measure.status] || 'gray') as color}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Typography variant='small' color='blue-gray' className='font-medium'>
              Responsable:
            </Typography>
            <Typography variant='small' color='blue-gray' className='font-bold'>
              {measure.reader_name}
            </Typography>
          </div>
          {measure.is_first_measure && (
            <Chip
              size='sm'
              value='Primera Medición'
              color='amber'
              className='font-medium'
            />
          )}
        </div>
      )}

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <Card className='shadow-sm'>
          <CardBody className='p-3 lg:p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-gray-50'>
                <ClipboardDocumentListIcon className='w-5 h-5 lg:w-6 lg:h-6 text-blue-gray-700' />
              </div>
              <div>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='font-medium leading-tight'
                >
                  Total Lecturas
                </Typography>
                <Typography variant='h4' color='blue-gray'>
                  {meterReadings.length}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className='shadow-sm'>
          <CardBody className='p-3 lg:p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-amber-50'>
                <ExclamationTriangleIcon className='w-5 h-5 lg:w-6 lg:h-6 text-amber-700' />
              </div>
              <div>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='font-medium leading-tight'
                >
                  Anomalías
                </Typography>
                <Typography variant='h4' color='amber'>
                  {meterReadings.filter((el) => el.has_anomaly).length}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className='shadow-sm'>
          <CardBody className='p-3 lg:p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-orange-50'>
                <EyeSlashIcon className='w-5 h-5 lg:w-6 lg:h-6 text-orange-700' />
              </div>
              <div>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='font-medium leading-tight'
                >
                  Sin Leer
                </Typography>
                <Typography variant='h4' color='orange'>
                  {meterReadings.filter((el) => el.status === 'not_read').length}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className='shadow-sm'>
          <CardBody className='p-3 lg:p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-red-50'>
                <WrenchIcon className='w-5 h-5 lg:w-6 lg:h-6 text-red-700' />
              </div>
              <div>
                <Typography
                  variant='small'
                  color='blue-gray'
                  className='font-medium leading-tight'
                >
                  Errores Medidor
                </Typography>
                <Typography variant='h4' color='red'>
                  {
                    meterReadings.filter((el) => el.status === 'meter_error')
                      .length
                  }
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
