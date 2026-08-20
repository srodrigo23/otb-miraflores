import { useState } from 'react';
import { toast } from 'react-toastify';

import { DetailCardsPayments } from '../../components/payments/DetailCardsPayments';
import { PaymentsFiltersBar } from '../../components/payments/PaymentsFilters';
import PaymentsTable from '../../components/tables/PaymentsTable';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { usePaymentsData } from '../../hooks/payments/usePaymentsData';
import { PaymentsReport } from '../../reports/PaymentsReport';
import { openReport, reportFileName } from '../../reports/openReport';

const Payments = () => {
  const {
    payments,
    totalCount,
    collectors,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    isLoading,
  } = usePaymentsData();

  const [isPreparingReport, setIsPreparingReport] = useState(false);

  /** The report issues exactly what the filters left on screen */
  const handleExportReport = async () => {
    if (isPreparingReport) return;
    setIsPreparingReport(true);
    try {
      await openReport(
        <PaymentsReport
          payments={payments}
          from={filters.from}
          to={filters.to}
          collector={filters.collector}
        />,
        reportFileName(['reporte-pagos', filters.from, filters.to]),
      );
    } catch {
      toast.error('No se pudo generar el reporte de pagos');
    } finally {
      setIsPreparingReport(false);
    }
  };

  if (isLoading) return <LoaderAnimation />;

  return (
    <div className='w-full flex flex-col gap-3 h-full min-h-0'>
      <div className='flex flex-col gap-3'>
        <DetailCardsPayments payments={payments} />
        <PaymentsFiltersBar
          filters={filters}
          collectors={collectors}
          hasActiveFilters={hasActiveFilters}
          resultCount={payments.length}
          totalCount={totalCount}
          isPreparingReport={isPreparingReport}
          onChange={updateFilters}
          onReset={resetFilters}
          onExport={handleExportReport}
        />
      </div>

      <div className='flex-1 min-h-0'>
        <PaymentsTable payments={payments} />
      </div>
    </div>
  );
};

export default Payments;
