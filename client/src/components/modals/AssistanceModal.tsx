import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Checkbox,
  Input,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

interface AssistanceType {
  id: number;
  meet_id: number;
  neighbor_id: number;
  neighbor_name: string | null;
  is_present: boolean;
  is_on_time: boolean;
  arrival_time: string | null;
  departure_time: string | null;
  excuse_reason: string | null;
  has_excuse: boolean;
  represented_by: string | null;
  has_representative: boolean;
  notes: string | null;
}

interface NeighborType {
  id: number;
  first_name: string;
  second_name: string;
  last_name: string;
  ci: string;
  phone_number: string;
  email: string;
}

interface NeighborWithAssistance extends NeighborType {
  assistance?: AssistanceType;
  is_present: boolean;
  is_on_time: boolean;
  notes: string;
}

interface MeetType {
  id: number;
  title: string;
  meet_date: string;
}

type AssistanceModalProps = {
  open: boolean;
  onClose: () => void;
  meet: MeetType | null;
};

const AssistanceModal: React.FC<AssistanceModalProps> = ({
  open,
  onClose,
  meet,
}) => {
  const [neighbors, setNeighbors] = useState<NeighborWithAssistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const apiLink = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (open && meet) {
      fetchData();
    }
  }, [open, meet]);

  const fetchData = async () => {
    if (!meet) return;

    setLoading(true);
    
    try {
      // Cargar vecinos y asistencias en paralelo
      const [neighborsResponse, assistancesResponse] = await Promise.all([
        fetch(`${apiLink}/neighbors/`),
        fetch(`${apiLink}/meets/${meet.id}/assistances`),
      ]);

      const neighborsData = await neighborsResponse.json();
      const assistancesData = await assistancesResponse.json();

      // Crear un mapa de asistencias por neighbor_id
      const assistanceMap = new Map<number, AssistanceType>();
      assistancesData.forEach((assistance: AssistanceType) => {
        assistanceMap.set(assistance.neighbor_id, assistance);
      });

      // Combinar vecinos con sus asistencias
      const combinedData: NeighborWithAssistance[] = (neighborsData.data || []).map(
        (neighbor: NeighborType) => {
          const assistance = assistanceMap.get(neighbor.id);
          return {
            ...neighbor,
            assistance,
            is_present: assistance?.is_present || false,
            is_on_time: assistance?.is_on_time || false,
            notes: assistance?.notes || '',
          };
        }
      );

      setNeighbors(combinedData);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresent = async (neighbor: NeighborWithAssistance) => {
    const newValue = !neighbor.is_present;

    // Actualizar UI optimísticamente
    setNeighbors((prev) =>
      prev.map((n) =>
        n.id === neighbor.id ? { ...n, is_present: newValue } : n
      )
    );

    setSaving(neighbor.id);

    try {
      if (neighbor.assistance) {
        // Actualizar asistencia existente
        await fetch(`${apiLink}/assistances/${neighbor.assistance.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_present: newValue }),
        });
      } else {
        // Crear nueva asistencia
        await fetch(`${apiLink}/meets/${meet?.id}/assistances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            neighbor_id: neighbor.id,
            is_present: newValue,
            is_on_time: false,
          }),
        });
      }

      // Recargar datos para obtener el ID de la asistencia creada
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la asistencia');
      // Revertir el cambio en caso de error
      setNeighbors((prev) =>
        prev.map((n) =>
          n.id === neighbor.id ? { ...n, is_present: !newValue } : n
        )
      );
    } finally {
      setSaving(null);
    }
  };

  const handleToggleOnTime = async (neighbor: NeighborWithAssistance) => {
    if (!neighbor.assistance) {
      toast.warning('Primero marque al vecino como presente');
      return;
    }

    const newValue = !neighbor.is_on_time;

    // Actualizar UI optimísticamente
    setNeighbors((prev) =>
      prev.map((n) =>
        n.id === neighbor.id ? { ...n, is_on_time: newValue } : n
      )
    );

    setSaving(neighbor.id);

    try {
      await fetch(`${apiLink}/assistances/${neighbor.assistance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_on_time: newValue }),
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la puntualidad');
      setNeighbors((prev) =>
        prev.map((n) =>
          n.id === neighbor.id ? { ...n, is_on_time: !newValue } : n
        )
      );
    } finally {
      setSaving(null);
    }
  };

  const handleNotesChange = async (neighbor: NeighborWithAssistance, notes: string) => {
    if (!neighbor.assistance) return;

    // Actualizar UI
    setNeighbors((prev) =>
      prev.map((n) => (n.id === neighbor.id ? { ...n, notes } : n))
    );
  };

  const handleNotesBlur = async (neighbor: NeighborWithAssistance) => {
    if (!neighbor.assistance) return;

    setSaving(neighbor.id);

    try {
      await fetch(`${apiLink}/assistances/${neighbor.assistance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: neighbor.notes }),
      });
      toast.success('Notas guardadas');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar las notas');
    } finally {
      setSaving(null);
    }
  };

  const getFullName = (neighbor: NeighborType) => {
    return `${neighbor.first_name} ${neighbor.second_name || ''} ${neighbor.last_name}`.trim();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const presentCount = neighbors.filter((n) => n.is_present).length;
  const onTimeCount = neighbors.filter((n) => n.is_on_time).length;

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>
        <div className="w-full">
          <div className="flex justify-between items-start">
            <div>
              <Typography variant="h4">Registro de Asistencia - {meet?.title}</Typography>
              <Typography variant="small" color="gray" className="font-normal">
                Fecha: {meet?.meet_date ? formatDateTime(meet.meet_date) : ''}
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="small" color="blue-gray" className="font-semibold">
                Presentes: {presentCount} / {neighbors.length}
              </Typography>
              <Typography variant="small" color="green" className="font-semibold">
                Puntuales: {onTimeCount}
              </Typography>
            </div>
          </div>
        </div>
      </DialogHeader>
      <DialogBody className="overflow-auto max-h-[60vh]">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <ClipLoader size={50} />
          </div>
        ) : neighbors.length === 0 ? (
          <Typography className="text-center py-10" color="gray">
            No hay vecinos registrados en el sistema
          </Typography>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 w-12">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      #
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Vecino
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Presente
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Puntual
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Notas
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {neighbors.map((neighbor, index) => {
                  const isLast = index === neighbors.length - 1;
                  const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';
                  const isSaving = saving === neighbor.id;

                  return (
                    <tr
                      key={neighbor.id}
                      className={`hover:bg-blue-gray-50/50 ${
                        neighbor.is_present ? 'bg-green-50' : ''
                      } ${isSaving ? 'opacity-50' : ''}`}
                    >
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {index + 1}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {getFullName(neighbor)}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                          CI: {neighbor.ci}
                        </Typography>
                      </td>
                      <td className={`${classes} text-center`}>
                        <Checkbox
                          checked={neighbor.is_present}
                          onChange={() => handleTogglePresent(neighbor)}
                          disabled={isSaving}
                          crossOrigin={undefined}
                          color="green"
                        />
                      </td>
                      <td className={`${classes} text-center`}>
                        <Checkbox
                          checked={neighbor.is_on_time}
                          onChange={() => handleToggleOnTime(neighbor)}
                          disabled={isSaving || !neighbor.assistance}
                          crossOrigin={undefined}
                          color="blue"
                        />
                      </td>
                      <td className={classes}>
                        <Input
                          value={neighbor.notes}
                          onChange={(e) => handleNotesChange(neighbor, e.target.value)}
                          onBlur={() => handleNotesBlur(neighbor)}
                          disabled={isSaving || !neighbor.assistance}
                          placeholder="Agregar notas..."
                          crossOrigin={undefined}
                          className="!min-w-[200px]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogBody>
      <DialogFooter className="flex justify-between">
        <div>
          <Typography variant="small" color="gray">
            Total vecinos: {neighbors.length} | Presentes: {presentCount} | Ausentes:{' '}
            {neighbors.length - presentCount}
          </Typography>
        </div>
        <Button variant="gradient" color="blue" onClick={onClose}>
          <span>Cerrar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AssistanceModal;
