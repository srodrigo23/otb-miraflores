import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  EyeSlashIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

import {
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';

import { StatCardGrid, StatDescriptor } from '../shared/StatCardGrid';

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

export const DetailCardsReadings: React.FC<{ meterReadings: MeterReadingType[] | [] }> = ({ meterReadings }) => {
  return (
    <div className='flex w-full shrink-0 flex-col gap-3'>
      <StatCardGrid stats={STATS} data={meterReadings} />
    </div>
  );
};
