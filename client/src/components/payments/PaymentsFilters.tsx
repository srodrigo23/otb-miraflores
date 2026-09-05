import {
  Button,
  Input,
  // Option,
  // Select,
  // Typography,
} from '@material-tailwind/react';
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

import { PaymentFilters } from '../../interfaces/paymentsInterfaces';

/**
 * Filter row for the payments table. The same range drives the printable
 * report, so what is on screen is what gets issued.
 */
export const PaymentsFiltersBar: React.FC<{
  filters: PaymentFilters;
  collectors: string[];
  hasActiveFilters: boolean;
  resultCount: number;
  totalCount: number;
  isPreparingReport: boolean;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onReset: () => void;
  onExport: () => void;
}> = ({
  filters,
  // collectors,
  hasActiveFilters,
  resultCount,
  // totalCount,
  isPreparingReport,
  onChange,
  onReset,
  onExport,
}) => (
  <div className='flex flex-col gap-3 rounded-lg py-4'>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
      <Input
        type='date'
        label='Desde'
        crossOrigin={undefined}
        value={filters.from}
        onChange={(e) => onChange({ from: e.target.value })}
      />
      <Input
        type='date'
        label='Hasta'
        crossOrigin={undefined}
        value={filters.to}
        onChange={(e) => onChange({ to: e.target.value })}
        // A range that ends before it starts would silently return nothing
        error={!!filters.from && !!filters.to && filters.to < filters.from}
      />
      {/* <Select
        label='Responsable'
        value={filters.collector}
        onChange={(value) => onChange({ collector: value ?? '' })}
      >
        <Option value=''>Todos</Option>
        {collectors.map((collector) => (
          <Option key={collector} value={collector}>
            {collector}
          </Option>
        ))}
      </Select> */}
      <Input
        label='Buscar'
        crossOrigin={undefined}
        icon={<MagnifyingGlassIcon className='h-4 w-4' />}
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
      />
      <Button
        variant='outlined'
        color='blue-gray'
        className='flex items-center justify-center gap-2 h-fit py-2.5 grow'
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        <ArrowPathIcon className='w-4 h-4' />
        Limpiar
      </Button>
      <Button
        variant='gradient'
        color='blue'
        className='flex items-center justify-center gap-2 h-fit'
        onClick={onExport}
        disabled={isPreparingReport || resultCount === 0}
      >
        <DocumentArrowDownIcon className='w-4 h-4' />
        {isPreparingReport ? 'Generando...' : 'Reporte PDF'}
      </Button>
      <div className='flex gap-2'>
      </div>
    </div>
    {/* <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'> */}
      {/* <Typography variant='small' color='blue-gray' className='font-normal'>
        {hasActiveFilters
          ? `Mostrando ${resultCount} de ${totalCount} pagos`
          : `${totalCount} pagos registrados`}
      </Typography> */}
    {/* </div> */}
  </div>
);
