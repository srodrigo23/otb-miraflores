
import { Card, CardBody, Typography } from '@material-tailwind/react';

import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { MeterReadingType } from '../../interfaces/measuresIterfaces';


export const DetailCardsReadings: React.FC<{ meterReadings: MeterReadingType[] }> = ({
  meterReadings
}) => {
  /**
   * total meters
   * total meter readings
   * total with anomaly
   * total 
   */

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
                Total
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
            <div className='p-2 rounded-lg bg-green-50'>
              <CheckCircleIcon className='w-5 h-5 lg:w-6 lg:h-6 text-green-700' />
            </div>
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='font-medium leading-tight'
              >
                Creadas
              </Typography>
              <Typography variant='h4' color='green'>
                {meterReadings.filter((el) => el.status === 'CREATED').length}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className='shadow-sm'>
        <CardBody className='p-3 lg:p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-blue-50'>
              <ArrowPathIcon className='w-5 h-5 lg:w-6 lg:h-6 text-blue-700' />
            </div>
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='font-medium leading-tight'
              >
                En Progreso
              </Typography>
              <Typography variant='h4' color='blue'>
                {
                  meterReadings.filter((el) => el.status === 'IN_PROGRESS')
                    .length
                }
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className='shadow-sm'>
        <CardBody className='p-3 lg:p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-red-50'>
              <LockClosedIcon className='w-5 h-5 lg:w-6 lg:h-6 text-red-700' />
            </div>
            <div>
              <Typography
                variant='small'
                color='blue-gray'
                className='font-medium leading-tight'
              >
                Cerradas
              </Typography>
              <Typography variant='h4' color='red'>
                {meterReadings.filter((el) => el.status === 'CLOSED').length}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
