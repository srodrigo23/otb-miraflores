
import { Card, CardBody, Typography } from '@material-tailwind/react';

import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { MeterReadingType } from '../../interfaces/measuresIterfaces';


export const DetailCardsReadings: React.FC<{ meterReadings: MeterReadingType[] }> = ({
  meterReadings
}) => {
  return (
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
  );
};
