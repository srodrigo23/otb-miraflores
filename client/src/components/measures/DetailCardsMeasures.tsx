import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

import { MeasureType } from '../../interfaces/measuresIterfaces';
import { StatCard, StatIcon, StatTone } from '../shared/StatCard';

type MeasureStat = {
  label: string;
  icon: StatIcon;
  tone: StatTone;
  /** How this card counts the measures it summarizes */
  count: (measures: MeasureType[]) => number;
};

const countByStatus = (status: MeasureType['status']) => (measures: MeasureType[]) =>
  measures.filter((measure) => measure.status === status).length;

const STATS: MeasureStat[] = [
  {
    label: 'Total',
    icon: ClipboardDocumentListIcon,
    tone: 'blue-gray',
    count: (measures) => measures.length,
  },
  {
    label: 'Creadas',
    icon: CheckCircleIcon,
    tone: 'green',
    count: countByStatus('CREATED'),
  },
  {
    label: 'En Progreso',
    icon: ArrowPathIcon,
    tone: 'blue',
    count: countByStatus('IN_PROGRESS'),
  },
  {
    label: 'Cerradas',
    icon: LockClosedIcon,
    tone: 'red',
    count: countByStatus('CLOSED'),
  },
];

export const DetailCardsMeasures: React.FC<{ measures: MeasureType[] }> = ({
  measures: measuresData,
}) => {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
      {STATS.map(({ label, icon, tone, count }) => (
        <StatCard
          key={label}
          label={label}
          icon={icon}
          tone={tone}
          value={count(measuresData)}
        />
      ))}
    </div>
  );
};
