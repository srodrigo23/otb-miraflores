import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useNeighborDetailsData } from '../../hooks/neighbors/useNeighborsData';
import { LoaderAnimation } from '../shared/LoaderAnimation';
import { toast } from 'react-toastify';

import {
  Card,
  CardBody,
  IconButton,
  Tooltip,
} from '@material-tailwind/react';
import {
  UserCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { PencilIcon } from 'lucide-react';

import { NeighborDebtsPayments } from '../NeighborDebtsPayments';
import { useUpdateNeighbor } from '../../hooks/neighbors/useUpdateNeighbor';
import {
  NeighborWithDetailsType,
  UpdateNeighborPayloadType,
} from '../../interfaces/neighborsInterfaces';
import { NeighborFieldErrors } from '../../types/NeighborsTypes';
import NeighborDataCard from './NeighborDataCard';
import EditNeighborModal from '../modals/EditNeighborModal';

type FieldErrors = NeighborFieldErrors;

const EDITABLE_FIELDS = [
  'names',
  'mat_lname',
  'pat_lname',
  'ci',
  'phone_number',
  'email',
] as const;

const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;
const digitsRegex = /^\d*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const norm = (v: unknown) => (v ?? '').toString().trim();

// Drop the read-only `id` to get an editable payload.
const toPayload = (n: NeighborWithDetailsType): UpdateNeighborPayloadType => {
  const { id, ...rest } = n;
  void id;
  return rest;
};

// Centered placeholder shell reused by the empty / error states.
const CenteredState: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className='flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center text-blue-gray-500'>
    {icon}
    <p className='text-lg font-semibold text-blue-gray-700'>{title}</p>
    {subtitle && <p className='text-sm'>{subtitle}</p>}
  </div>
);

export const NeighborDetails: React.FC<{
  neighborId: number | undefined;
  refetchNeighbors: () => void;
}> = ({ neighborId, refetchNeighbors }) => {
  // Doubles as the edit-modal visibility: the modal is only ever open to edit.
  const [edit, setEdit] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error } = useNeighborDetailsData(neighborId);
  const [toUpdateDataNeighbor, setToUpdateDataNeighbor] =
    useState<UpdateNeighborPayloadType>();
  const { update } = useUpdateNeighbor(data?.id);

  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (data) {
      setToUpdateDataNeighbor(toPayload(data));
      setErrors({});
      setEdit(false);
    }
  }, [data]);

  // Only enable "save" when something actually changed.
  const isDirty = useMemo(() => {
    if (!data || !toUpdateDataNeighbor) return false;
    return EDITABLE_FIELDS.some(
      (f) => norm(data[f]) !== norm(toUpdateDataNeighbor[f]),
    );
  }, [data, toUpdateDataNeighbor]);

  const sanitize = (field: keyof UpdateNeighborPayloadType, raw: string) => {
    if (['names', 'mat_lname', 'pat_lname'].includes(field)) {
      return nameRegex.test(raw) ? raw : null;
    }
    if (['ci', 'phone_number'].includes(field)) {
      return digitsRegex.test(raw) ? raw : null;
    }
    return raw;
  };

  const handleFieldChange =
    (field: keyof UpdateNeighborPayloadType) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      const raw = e.target.value;
      const sanitized = sanitize(field, raw);
      if (sanitized === null) return;
      setToUpdateDataNeighbor((prev) =>
        prev ? { ...prev, [field]: sanitized || null } : prev,
      );
    };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!toUpdateDataNeighbor?.names?.trim()) {
      newErrors.names = 'Los nombres son requeridos';
    } else if (!nameRegex.test(toUpdateDataNeighbor.names)) {
      newErrors.names = 'Solo se permiten letras y espacios';
    }

    if (!toUpdateDataNeighbor?.pat_lname?.trim()) {
      newErrors.pat_lname = 'El apellido es requerido';
    } else if (!nameRegex.test(toUpdateDataNeighbor.pat_lname)) {
      newErrors.pat_lname = 'Solo se permiten letras y espacios';
    }

    if (
      toUpdateDataNeighbor?.mat_lname &&
      !nameRegex.test(toUpdateDataNeighbor.mat_lname)
    ) {
      newErrors.mat_lname = 'Solo se permiten letras y espacios';
    }

    if (norm(toUpdateDataNeighbor?.ci) && !digitsRegex.test(norm(toUpdateDataNeighbor?.ci))) {
      newErrors.ci = 'Solo se permiten números';
    }
    if (
      norm(toUpdateDataNeighbor?.phone_number) &&
      !digitsRegex.test(norm(toUpdateDataNeighbor?.phone_number))
    ) {
      newErrors.phone_number = 'Solo se permiten números';
    }

    if (
      toUpdateDataNeighbor?.email &&
      !emailRegex.test(toUpdateDataNeighbor.email.trim())
    ) {
      newErrors.email = 'Correo electrónico no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateNeighborDetail = async () => {
    if (!toUpdateDataNeighbor || isSaving) return;
    if (!validate()) {
      toast.warning('Corrige los campos resaltados antes de guardar');
      return;
    }
    setIsSaving(true);
    try {
      const result = await update(toUpdateDataNeighbor);
      if (result?.ok) {
        toast.success('Datos del vecino editados correctamente');
        refetchNeighbors();
        setEdit(false);
      } else {
        // Keep edit mode open so the user can retry without re-typing.
        toast.error('Ocurrió un error al editar los datos');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (data) {
      setToUpdateDataNeighbor(toPayload(data));
    }
    setEdit(false);
  };

  // Keyboard: Esc cancels, Cmd/Ctrl+Enter saves while editing.
  useEffect(() => {
    if (!edit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancelEdit();
      else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') updateNeighborDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, toUpdateDataNeighbor, isSaving]);

  if (neighborId === undefined) {
    return (
      <CenteredState
        icon={<UserCircleIcon className='h-14 w-14 text-blue-gray-300' />}
        title='Selecciona un vecino'
        subtitle='Elige un vecino de la lista para ver sus datos y medidores.'
      />
    );
  }
  if (isLoading) return <LoaderAnimation />;
  if (error) {
    return (
      <CenteredState
        icon={<ExclamationTriangleIcon className='h-14 w-14 text-red-400' />}
        title='No se pudieron cargar los datos'
        subtitle='Vuelve a seleccionar el vecino o inténtalo más tarde.'
      />
    );
  }

  return (
    <div className='mx-auto container w-full flex flex-col gap-4 lg:gap-2 flex-1 min-h-0 py-3 px-3 lg:px-3'>
      <Card className='w-full shrink-0 shadow-sm'>
        <CardBody className='flex items-center justify-between gap-3 p-3 lg:px-6'>
          <NeighborDataCard neighborData={data} />
          <Tooltip content='Editar datos'>
            <IconButton
              size='sm'
              variant='outlined'
              color='blue-gray'
              onClick={() => setEdit(true)}
              aria-label='Editar datos del vecino'
              className='shrink-0'
            >
              <PencilIcon className='h-5 w-5' />
            </IconButton>
          </Tooltip>
        </CardBody>
      </Card>

      <EditNeighborModal
        openModalState={edit}
        handleCloseModal={handleCancelEdit}
        neighbor={data}
        values={toUpdateDataNeighbor}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={updateNeighborDetail}
        isSaving={isSaving}
        canSave={isDirty}
      />

      <NeighborDebtsPayments
        neighborId={data?.id}
        neighbor={{
          fullName: `${data?.pat_lname ?? ''} ${data?.names ?? ''} ${data?.mat_lname ?? ''}`
            .replace(/\s+/g, ' ')
            .trim(),
          ci: data?.ci ? String(data.ci) : '',
        }}
      />
    </div>
  );
};
