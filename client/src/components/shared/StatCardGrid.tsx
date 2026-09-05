import { StatCard, StatIcon, StatTone } from './StatCard';

/**
 * One card in a summary row, declared apart from the data it will read. Pages
 * describe their KPIs as a constant list and the grid does the rendering, so a
 * new card is a new entry rather than another block of markup.
 */
export type StatDescriptor<T> = {
  label: string;
  icon: StatIcon;
  tone: StatTone;
  /** Returning a string keeps units and currency attached to the figure. */
  value: (data: T) => number | string;
};

type StatCardGridProps<T> = {
  stats: StatDescriptor<T>[];
  /** Passed whole to every descriptor, so each card reads what it needs. */
  data: T;
  className?: string;
};

/** The KPI row shared by the measures, readings and payments screens */
export function StatCardGrid<T>({
  stats,
  data,
  className = '',
}: StatCardGridProps<T>) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 w-full ${className}`}>
      {stats.map(({ label, icon, tone, value }) => (
        <StatCard
          key={label}
          label={label}
          icon={icon}
          tone={tone}
          value={value(data)}
        />
      ))}
    </div>
  );
}
