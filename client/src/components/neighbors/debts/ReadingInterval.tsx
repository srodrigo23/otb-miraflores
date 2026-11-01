import { NUMERIC } from '../../../utils/format';

/** The reading interval the debt was born from: previous, current and the delta */
export const ReadingInterval: React.FC<{
  previousReading: number;
  currentReading: number;
  consumption: number;
}> = ({ previousReading, currentReading, consumption }) => (
  // Label/value pairs; where it sits in the card is the parent's call
  <dl
    className={`grid grid-cols-[auto_auto] justify-start gap-x-3 text-sm text-blue-gray-500 ${NUMERIC}`}
  >
    <dt>Lec. anterior</dt>
    <dd className='font-semibold text-blue-gray-800'>{previousReading}</dd>
    <dt>Lec. actual</dt>
    <dd className='font-semibold text-blue-gray-800'>{currentReading}</dd>
    <dt>Consumo</dt>
    <dd className='font-bold text-cyan-800'>{consumption} m³</dd>
  </dl>
);
