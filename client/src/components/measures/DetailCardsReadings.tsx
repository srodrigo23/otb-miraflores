import { Chip, Typography } from '@material-tailwind/react';

import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  EyeSlashIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import {
  MeasureType,
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';
import { color } from '../../types/commonTypes';
import { formatDate } from '../../utils/dates';
import { StatCardGrid, StatDescriptor } from '../shared/StatCardGrid';

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

const countByStatus = (status: string) => (readings: MeterReadingType[]) =>
  readings.filter((reading) => reading.status === status).length;

const STATS: StatDescriptor<MeterReadingType[]>[] = [
  {
    label: 'Total Lecturas',
    icon: ClipboardDocumentListIcon,
    tone: 'blue-gray',
    value: (readings) => readings.length,
  },
  {
    label: 'Leídas',
    icon: CheckCircleIcon,
    tone: 'green',
    value: countByStatus('READED'),
  },
  {
    label: 'Sin Leer',
    icon: EyeSlashIcon,
    tone: 'orange',
    value: countByStatus('UNREAD'),
  },
  {
    label: 'Errores Medidor',
    icon: WrenchIcon,
    tone: 'red',
    value: countByStatus('METER_ERROR'),
  },
];

/** One labelled fact from the measure header, e.g. "Periodo: 2025-01" */
const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className='flex items-center gap-2'>
    <Typography variant='small' color='blue-gray' className='font-medium'>
      {label}:
    </Typography>
    {children}
  </div>
);

export const DetailCardsReadings: React.FC<{
  meterReadings: MeterReadingType[] | [];
  measure: MeasureType | undefined;
}> = ({ meterReadings, measure }) => {
  return (
    <div className='flex flex-col gap-3 w-full'>
      {measure && (
        <div className='flex flex-wrap items-center gap-4 px-1'>
          <MetaField label='Fecha'>
            <Typography variant='small' color='blue-gray' className='font-bold'>
              {formatDate(measure.measure_date)}
            </Typography>
          </MetaField>
          <MetaField label='Periodo'>
            <span className='px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-sm font-semibold'>
              {measure.period}
            </span>
          </MetaField>
          <MetaField label='Estado'>
            <Chip
              size='sm'
              value={STATUS_LABELS[measure.status] || measure.status}
              color={(STATUS_COLORS[measure.status] || 'gray') as color}
            />
          </MetaField>
          <MetaField label='Responsable'>
            <Typography variant='small' color='blue-gray' className='font-bold'>
              {measure.reader_name}
            </Typography>
          </MetaField>
        </div>
      )}

      <StatCardGrid stats={STATS} data={meterReadings} />
    </div>
  );
};
