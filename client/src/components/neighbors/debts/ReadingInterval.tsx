import { NUMERIC } from '../../../utils/format';

/** The reading interval the debt was born from: previous, current and the delta */
export const ReadingInterval: React.FC<{
  previousReading: number;
  currentReading: number;
  consumption: number;
}> = ({ previousReading, currentReading, consumption }) => (
  <div className='flex items-center gap-2 rounded-md bg-blue-gray-50/70 px-2.5 py-1.5'>
    <span className={`text-sm text-blue-gray-600 ${NUMERIC}`}>
      {previousReading}
    </span>
    <span aria-hidden className='text-blue-gray-300'>
      →
    </span>
    <span className={`text-sm font-semibold text-blue-gray-800 ${NUMERIC}`}>
      {currentReading}
    </span>
    <span className={`ml-auto text-sm font-bold text-cyan-800 ${NUMERIC}`}>
      {consumption} m³
    </span>
  </div>
);
