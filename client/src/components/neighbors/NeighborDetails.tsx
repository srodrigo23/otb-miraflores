import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useNeighborDetailsData } from '../../hooks/neighbors/useNeighborsData';
import { LoaderAnimation } from '../shared/LoaderAnimation';
import { toast } from 'react-toastify';
import { InfoField } from './InfoField';

import {
  Card,
  CardBody,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Button,
} from '@material-tailwind/react';
import {
  ChevronDownIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { NeighborDebtsPayments } from '../NeighborDebtsPayments';
import { useUpdateNeighbor } from '../../hooks/neighbors/useUpdateNeighbor';
import {
  NeighborWithDetailsType,
  UpdateNeighborPayloadType,
} from '../../interfaces/neighborsInterfaces';
import NeighborDataCard from './NeighborDataCard';
import EditNeighborDataControls from './EditNeighborDataControls';

type FieldErrors = Partial<Record<keyof UpdateNeighborPayloadType, string>>;

const EDITABLE_FIELDS = [
  'first_name',
  'second_name',
  'last_name',
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
  const [openInfo, setOpenInfo] = useState(false);
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
    if (['first_name', 'second_name', 'last_name'].includes(field)) {
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

    if (!toUpdateDataNeighbor?.first_name?.trim()) {
      newErrors.first_name = 'El primer nombre es requerido';
    } else if (!nameRegex.test(toUpdateDataNeighbor.first_name)) {
      newErrors.first_name = 'Solo se permiten letras y espacios';
    }

    if (!toUpdateDataNeighbor?.last_name?.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (!nameRegex.test(toUpdateDataNeighbor.last_name)) {
      newErrors.last_name = 'Solo se permiten letras y espacios';
    }

    if (
      toUpdateDataNeighbor?.second_name &&
      !nameRegex.test(toUpdateDataNeighbor.second_name)
    ) {
      newErrors.second_name = 'Solo se permiten letras y espacios';
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

  const handleHeaderClick = () => {
    // Don't collapse while editing — it would silently discard unsaved changes.
    if (edit) return;
    setOpenInfo((o) => !o);
  };

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
    <div className='mx-auto container w-full flex flex-col gap-4 lg:gap-6 h-full py-3 px-3 lg:px-3'>
      <div>
        <Card className='w-full shadow-sm p-0'>
          <CardBody className='p-0'>
            <Accordion open={openInfo} className='py-0'>
              <AccordionHeader
                className={`flex items-center justify-between px-4 lg:px-6 ${
                  edit ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={handleHeaderClick}
              >
                <NeighborDataCard neighborData={data} />
                {!edit && (
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-blue-gray-500 transition-transform duration-200 ${
                      openInfo ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </AccordionHeader>
              <AccordionBody>
                <EditNeighborDataControls
                  edit={edit}
                  setEdit={setEdit}
                  updateNeighborDetail={updateNeighborDetail}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                  canSave={isDirty}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-5 lg:gap-y-4 px-4 lg:px-6 pb-6 text-center'>
                  <InfoField
                    label='Primer Nombre'
                    value={toUpdateDataNeighbor?.first_name}
                    isInput={edit}
                    onChange={handleFieldChange('first_name')}
                    error={errors.first_name}
                  />
                  <InfoField
                    label='Segundo Nombre'
                    value={toUpdateDataNeighbor?.second_name || ''}
                    isInput={edit}
                    onChange={handleFieldChange('second_name')}
                    error={errors.second_name}
                  />
                  <InfoField
                    label='Apellido'
                    value={toUpdateDataNeighbor?.last_name}
                    isInput={edit}
                    onChange={handleFieldChange('last_name')}
                    error={errors.last_name}
                  />
                  <InfoField
                    label='Cédula de Identidad'
                    value={toUpdateDataNeighbor?.ci || ''}
                    isInput={edit}
                    onChange={handleFieldChange('ci')}
                    error={errors.ci}
                    inputMode='numeric'
                  />
                  <InfoField
                    label='Teléfono'
                    value={toUpdateDataNeighbor?.phone_number || ''}
                    isInput={edit}
                    onChange={handleFieldChange('phone_number')}
                    error={errors.phone_number}
                    inputMode='tel'
                  />
                  <InfoField
                    label='Email'
                    value={toUpdateDataNeighbor?.email || ''}
                    isInput={edit}
                    onChange={handleFieldChange('email')}
                    error={errors.email}
                    type='email'
                    inputMode='email'
                  />
                  <InfoField
                    label='Fecha de Nacimiento'
                    value={
                      data?.birth_day
                        ? new Date(data.birth_day).toLocaleDateString('es-ES')
                        : '-'
                    }
                    isInput={false}
                  />
                </div>

                {edit && (
                  <div className='flex justify-end gap-2 px-4 lg:px-6 pb-5'>
                    <Button
                      variant='text'
                      color='blue-gray'
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      color='green'
                      onClick={updateNeighborDetail}
                      disabled={isSaving || !isDirty}
                      loading={isSaving}
                    >
                      Guardar cambios
                    </Button>
                  </div>
                )}
              </AccordionBody>
            </Accordion>
          </CardBody>
        </Card>
      </div>

      <NeighborDebtsPayments />
    </div>
  );
};
