import { Card, CardBody, Typography } from '@material-tailwind/react';

/**
 * Tailwind classes have to be written in full: the compiler scans the source for
 * literal class names, so building them as `bg-${tone}-50` would silently
 * produce an unstyled card.
 */
const TONES = {
  'blue-gray': { badge: 'bg-blue-gray-50', icon: 'text-blue-gray-700' },
  green: { badge: 'bg-green-50', icon: 'text-green-700' },
  blue: { badge: 'bg-blue-50', icon: 'text-blue-700' },
  amber: { badge: 'bg-amber-50', icon: 'text-amber-700' },
  orange: { badge: 'bg-orange-50', icon: 'text-orange-700' },
  red: { badge: 'bg-red-50', icon: 'text-red-700' },
} as const;

export type StatTone = keyof typeof TONES;

/**
 * Only the className is passed down. Typing it as SVGProps would reject the
 * heroicons components, which are forwardRef and narrow the `ref` prop.
 */
export type StatIcon = React.ComponentType<{ className?: string }>;

/** A labelled counter with an icon badge, as used by the summary rows */
export const StatCard: React.FC<{
  label: string;
  value: number;
  icon: StatIcon;
  tone: StatTone;
}> = ({ label, value, icon: Icon, tone }) => (
  <Card className='shadow-sm'>
    <CardBody className='p-3 lg:p-4'>
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg ${TONES[tone].badge}`}>
          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${TONES[tone].icon}`} />
        </div>
        <div>
          <Typography
            variant='small'
            color='blue-gray'
            className='font-medium leading-tight'
          >
            {label}
          </Typography>
          <Typography variant='h4' color={tone}>
            {value}
          </Typography>
        </div>
      </div>
    </CardBody>
  </Card>
);
