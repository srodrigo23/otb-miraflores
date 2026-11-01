import { useState } from 'react';
import { MeterLedger } from '../../../interfaces/neighborDebtsInterfaces';
import { NUMERIC } from '../../../utils/format';
import { MeterConsumptionChart } from './MeterConsumptionChart';
import { EmptyState } from '../../shared/EmptyState';

const PANEL =
  'flex min-h-[16rem] flex-col rounded-lg border border-blue-gray-100 bg-white p-4';

/** Consumption per period of one meter, one gestión at a time */
export const MeterConsumptionPanel: React.FC<{ meter: MeterLedger }> = ({
  meter,
}) => {
  // const averageConsumption = Math.round(
  //   meter.history.reduce((total, point) => total + point.consumption, 0) /
  //     meter.history.length,
  // );
  // A pending debt is owed in full, so the balance is just their sum
  // const totalOwed = meter.debts
  //   .filter((debt) => debt.status === 'PENDING')
  //   .reduce((total, debt) => total + debt.amount, 0);

  // History comes oldest first, so the years come out in ascending order
  const years = [...new Set(meter.history.map((point) => point.year))];
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    years[years.length - 1],
  );

  if (years.length === 0) {
    return (
      <div className={PANEL}>
        <EmptyState message='Este medidor aún no tiene lecturas registradas' />
      </div>
    );
  }

  const yearHistory = meter.history.filter(
    (point) => point.year === selectedYear,
  );

  return (
    <div className={PANEL}>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-sm font-bold uppercase tracking-wide text-blue-gray-700'>
          Consumo por periodo, en m³
        </h3>

        {years.length > 1 ? (
          // Segmented control: with only a few gestiones, every option stays
          // visible and is one click away, unlike a dropdown
          <div
            role='group'
            aria-label='Gestión'
            className='flex rounded-lg border border-blue-gray-100 bg-blue-gray-50/50 p-0.5'
          >
            {years.map((year) => {
              const isSelected = year === selectedYear;
              return (
                <button
                  key={year}
                  type='button'
                  aria-pressed={isSelected}
                  onClick={() => setSelectedYear(year)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${NUMERIC} ${
                    isSelected
                      ? 'bg-white text-cyan-800 shadow-sm'
                      : 'text-blue-gray-500 hover:text-blue-gray-800'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : (
          // A single gestión needs no picker, but it is still named
          <span
            className={`rounded-md bg-blue-gray-50 px-2.5 py-1 text-xs font-semibold text-blue-gray-600 ${NUMERIC}`}
          >
            Gestión {selectedYear}
          </span>
        )}
      </div>

      <div className='min-h-[11rem] flex-1'>
        <MeterConsumptionChart data={yearHistory} />
      </div>

      {/* <dl className='mt-3 grid grid-cols-2 gap-3 border-t border-blue-gray-50 pt-3'>
        <div>
          <dt className='text-xs text-blue-gray-500'>Consumo promedio</dt>
          <dd className={`text-lg font-bold text-cyan-800 ${NUMERIC}`}>
            {averageConsumption} m³
          </dd>
        </div>
        <div>
          <dt className='text-xs text-blue-gray-500'>Saldo del medidor</dt>
          <dd
            className={`text-lg font-bold ${NUMERIC} ${
              totalOwed > 0 ? 'text-amber-800' : 'text-green-700'
            }`}
          >
            {currency(totalOwed)}
          </dd>
        </div>
      </dl> */}
    </div>
  );
};
