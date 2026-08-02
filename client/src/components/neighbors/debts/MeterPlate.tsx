import { MeterLedger } from '../../../interfaces/neighborDebtsInterfaces';
import { currency, NUMERIC } from '../../../utils/format';

/**
 * Meter selector entry. Each meter is its own plate showing what it owes right
 * on the tab, so the collector picks by amount and not only by code.
 */
export const MeterPlate: React.FC<{
  meter: MeterLedger;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ meter, isSelected, onSelect }) => {
  // A pending debt is owed in full, so the balance is just their sum
  const owed = meter.debts
    .filter((debt) => debt.status === 'PENDING')
    .reduce((total, debt) => total + debt.amount, 0);

  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
        isSelected
          ? 'border-cyan-600 bg-cyan-50/70'
          : 'border-blue-gray-100 bg-white hover:border-blue-gray-300'
      }`}
    >
      <span
        className={`h-8 w-1 rounded-full ${
          isSelected ? 'bg-cyan-600' : 'bg-blue-gray-100'
        }`}
      />
      <span>
        <span
          className={`block text-sm font-bold leading-tight text-blue-gray-800 ${NUMERIC}`}
        >
          {meter.meter_code}
        </span>
        <span className='block text-xs leading-tight text-blue-gray-500'>
          Sección {meter.section}
        </span>
      </span>
      <span
        className={`ml-2 text-sm font-bold ${NUMERIC} ${
          owed > 0 ? 'text-amber-800' : 'text-green-700'
        }`}
      >
        {owed > 0 ? currency(owed) : 'Al día'}
      </span>
    </button>
  );
};
