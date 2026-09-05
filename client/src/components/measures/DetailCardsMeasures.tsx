import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

import { MeasureType } from '../../interfaces/measuresIterfaces';
import { StatCardGrid, StatDescriptor } from '../shared/StatCardGrid';

const countByStatus =
  (status: MeasureType['status']) => (measures: MeasureType[]) =>
    measures.filter((measure) => measure.status === status).length;

const STATS: StatDescriptor<MeasureType[]>[] = [
  {
    label: 'Total',
    icon: ClipboardDocumentListIcon,
    tone: 'blue-gray',
    value: (measures) => measures.length,
  },
  {
    label: 'Creadas',
    icon: CheckCircleIcon,
    tone: 'green',
    value: countByStatus('CREATED'),
  },
  {
    label: 'En Progreso',
    icon: ArrowPathIcon,
    tone: 'blue',
    value: countByStatus('IN_PROGRESS'),
  },
  {
    label: 'Cerradas',
    icon: LockClosedIcon,
    tone: 'red',
    value: countByStatus('CLOSED'),
  },
];

export const DetailCardsMeasures: React.FC<{ measures: MeasureType[] }> = ({
  measures,
}) => <StatCardGrid stats={STATS} data={measures} />;
