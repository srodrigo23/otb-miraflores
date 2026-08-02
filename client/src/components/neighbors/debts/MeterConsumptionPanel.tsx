import { MeterLedger } from '../../../interfaces/neighborDebtsInterfaces';
import { currency, NUMERIC } from '../../../utils/format';
import { MeterConsumptionChart } from './MeterConsumptionChart';

/** Consumption over time for one meter, with the two figures the line summarizes */
export const MeterConsumptionPanel: React.FC<{ meter: MeterLedger }> = ({
  meter,
}) => {
  const averageConsumption = Math.round(
    meter.history.reduce((total, point) => total + point.consumption, 0) /
      meter.history.length,
  );
  // A pending debt is owed in full, so the balance is just their sum
  const totalOwed = meter.debts
    .filter((debt) => debt.status === 'PENDING')
    .reduce((total, debt) => total + debt.amount, 0);

  return (
    <div className='flex min-h-[16rem] flex-col rounded-lg border border-blue-gray-100 bg-white p-4'>
      <div className='mb-3 flex items-baseline justify-between'>
        <h3 className='text-sm font-bold uppercase tracking-wide text-blue-gray-700'>
          Consumo por periodo, en m³
        </h3>
        <span className={`text-xs text-blue-gray-500 ${NUMERIC}`}>
          {meter.meter_code}
        </span>
      </div>

      <div className='min-h-[11rem] flex-1'>
        <MeterConsumptionChart data={meter.history} />
      </div>

      <dl className='mt-3 grid grid-cols-2 gap-3 border-t border-blue-gray-50 pt-3'>
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
      </dl>
    </div>
  );
};
