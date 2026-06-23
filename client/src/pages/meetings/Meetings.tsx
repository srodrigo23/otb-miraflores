import { CSSProperties, useEffect, useState } from 'react';
import { Typography } from '@material-tailwind/react';
import MeetTable from '../../components/tables/MeetTable';
import AssistanceModal from '../../components/modals/AssistanceModal';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

interface MeetType {
  id: number;
  meet_date: string;
  meet_type: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  is_mandatory: boolean;
  total_neighbors: number;
  total_present: number;
  total_absent: number;
  total_on_time: number;
  organizer: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};

const Meetings = () => {
  const [data, setData] = useState<MeetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeet, setSelectedMeet] = useState<MeetType | null>(null);
  const [openAssistanceModal, setOpenAssistanceModal] = useState(false);

  const apiLink = 'http://127.0.0.1:8000/meets';

  // Cargar datos de reuniones
  const fetchMeets = () => {
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
        toast.error('Error al cargar las reuniones');
      });
  };

  useEffect(() => {
    fetchMeets();
  }, []);

  // Handler para crear nueva reunión
  const handleCreateMeet = (formData: any) => {
    fetch(apiLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meet_date: formData.meetDate,
        meet_type: formData.meetType,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        is_mandatory: formData.isMandatory,
        organizer: formData.organizer,
        notes: formData.notes,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchMeets();
        toast.success('Reunión creada exitosamente');
      })
      .catch((error) => {
        console.error('Error al crear reunión:', error);
        toast.error('Error al crear la reunión');
      });
  };

  // Handler para ver detalles
  const handleViewMeet = (meet: MeetType) => {
    // TODO: Implementar vista de detalles
    console.log('Ver reunión:', meet);
    toast.info('Función de vista de detalles en desarrollo');
  };

  // Handler para editar
  const handleEditMeet = (meet: MeetType) => {
    // TODO: Implementar edición
    console.log('Editar reunión:', meet);
    toast.info('Función de edición en desarrollo');
  };

  // Handler para eliminar
  const handleDeleteMeet = (meet: MeetType) => {
    if (window.confirm(`¿Está seguro de eliminar la reunión "${meet.title}"?`)) {
      fetch(`${apiLink}/${meet.id}`, {
        method: 'DELETE',
      })
        .then(() => {
          fetchMeets();
          toast.success('Reunión eliminada exitosamente');
        })
        .catch((error) => {
          console.error('Error al eliminar reunión:', error);
          toast.error('Error al eliminar la reunión');
        });
    }
  };

  // Handler para ver asistencias
  const handleViewAssistances = (meet: MeetType) => {
    setSelectedMeet(meet);
    setOpenAssistanceModal(true);
  };

  // Handler para cerrar modal de asistencias
  const handleCloseAssistanceModal = () => {
    setOpenAssistanceModal(false);
    setSelectedMeet(null);
  };

  return (
    <>
      <Typography className='text-center mb-2' variant='h3' color='black'>
        Reuniones
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
          <MeetTable
            tableData={data}
            onCreate={handleCreateMeet}
            onView={handleViewMeet}
            onEdit={handleEditMeet}
            onDelete={handleDeleteMeet}
            onViewAssistances={handleViewAssistances}
          />
        </div>
      )}

      <AssistanceModal
        open={openAssistanceModal}
        onClose={handleCloseAssistanceModal}
        meet={selectedMeet}
      />
    </>
  );
};

export default Meetings;