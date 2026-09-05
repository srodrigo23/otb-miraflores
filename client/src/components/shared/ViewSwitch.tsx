import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';
import { ViewMode } from '../../types/commonTypes';

interface ViewSwitchProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

/** Heroicons v2 ships forward-ref components; derive the shape from one. */
type HeroIcon = typeof Squares2X2Icon;

const OPTIONS: { mode: ViewMode; label: string; Icon: HeroIcon }[] = [
  { mode: 'cards', label: 'Ver en tarjetas', Icon: Squares2X2Icon },
  { mode: 'table', label: 'Ver en tabla', Icon: TableCellsIcon },
];

/** Segmented control for swapping one collection between two renderings. */
export const ViewSwitch: React.FC<ViewSwitchProps> = ({
  value,
  onChange,
  className = '',
}) => (
  <div
    role='group'
    aria-label='Cambiar vista'
    className={`flex shrink-0 gap-0.5 rounded-lg border border-blue-gray-100 bg-blue-gray-50/60 p-0.5 ${className}`}
  >
    {OPTIONS.map(({ mode, label, Icon }) => {
      const isActive = value === mode;

      return (
        <button
          key={mode}
          type='button'
          onClick={() => onChange(mode)}
          title={label}
          aria-label={label}
          aria-pressed={isActive}
          className={`rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isActive
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-blue-gray-500 hover:text-blue-gray-900'
          }`}
        >
          <Icon className='h-5 w-5' />
        </button>
      );
    })}
  </div>
);
