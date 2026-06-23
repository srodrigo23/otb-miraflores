import { CSSProperties, useEffect, useState } from 'react';
import { Typography } from '@material-tailwind/react';
import CollectDebtTable from '../../components/tables/CollectDebtTable';
import CollectDebtPaymentsModal from '../../components/modals/CollectDebtPaymentsModal';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

interface CollectDebtType {
  id: number;
  collect_date: string;
  period: string | null;
  collector_name: string | null;
  location: string | null;
  status: string;
  total_payments: number;
  total_collected: number;
  total_neighbors_paid: number;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const Collections = () => {
  const [data, setData] = useState<CollectDebtType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollectDebt, setSelectedCollectDebt] = useState<CollectDebtType | null>(null);
  const [openPaymentsModal, setOpenPaymentsModal] = useState(false);

  const apiLink = 'http://127.0.0.1:8000/collect-debts';

  // Cargar datos de recaudaciones
  const fetchCollectDebts = () => {
    setLoading(true);
    fetch(apiLink, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        toast.error('Error al cargar las recaudaciones');
      });
  };

  useEffect(() => {
    fetchCollectDebts();
  }, []);

  // Handler para crear nueva recaudación
  const handleCreateCollectDebt = (formData: any) => {
    fetch(apiLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collect_date: formData.collectDate,
        period: formData.period,
        collector_name: formData.collectorName,
        location: formData.location,
        notes: formData.notes,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchCollectDebts();
        toast.success('Recaudación creada exitosamente');
      })
      .catch((error) => {
        console.error('Error al crear recaudación:', error);
        toast.error('Error al crear la recaudación');
      });
  };

  // Handler para ver detalles
  const handleViewCollectDebt = (collectDebt: CollectDebtType) => {
    // TODO: Implementar vista de detalles
    console.log('Ver recaudación:', collectDebt);
    toast.info('Función de vista de detalles en desarrollo');
  };

  // Handler para editar
  const handleEditCollectDebt = (collectDebt: CollectDebtType) => {
    // TODO: Implementar edición
    console.log('Editar recaudación:', collectDebt);
    toast.info('Función de edición en desarrollo');
  };

  // Handler para eliminar
  const handleDeleteCollectDebt = (collectDebt: CollectDebtType) => {
    if (window.confirm(`¿Está seguro de eliminar la recaudación del ${collectDebt.collect_date}?`)) {
      fetch(`${apiLink}/${collectDebt.id}`, {
        method: 'DELETE',
      })
        .then(() => {
          fetchCollectDebts();
          toast.success('Recaudación eliminada exitosamente');
        })
        .catch((error) => {
          console.error('Error al eliminar recaudación:', error);
          toast.error('Error al eliminar la recaudación');
        });
    }
  };

  // Handler para ver pagos
  const handleViewPayments = (collectDebt: CollectDebtType) => {
    setSelectedCollectDebt(collectDebt);
    setOpenPaymentsModal(true);
  };

  // Handler para cerrar modal de pagos
  const handleClosePaymentsModal = () => {
    setOpenPaymentsModal(false);
    setSelectedCollectDebt(null);
    // Recargar datos para actualizar estadísticas
    fetchCollectDebts();
  };

  return (
    <>
      <Typography className='text-center mb-2' variant='h3' color='black'>
        Recaudaciones
      </Typography>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <ClipLoader
            loading={loading}
            cssOverride={override}
            size={150}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        </div>
      ) : (
        <div className='p-10'>
          <CollectDebtTable
            tableData={data}
            onCreate={handleCreateCollectDebt}
            onView={handleViewCollectDebt}
            onEdit={handleEditCollectDebt}
            onDelete={handleDeleteCollectDebt}
            onViewPayments={handleViewPayments}
          />
        </div>
      )}

      <CollectDebtPaymentsModal
        open={openPaymentsModal}
        onClose={handleClosePaymentsModal}
        collectDebt={selectedCollectDebt}
      />
    </>
  );
};

export default Collections;
