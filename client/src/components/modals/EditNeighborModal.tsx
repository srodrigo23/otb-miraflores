import { ChangeEvent } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Typography,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';

import {
  NeighborWithDetailsType,
  UpdateNeighborPayloadType,
} from '../../interfaces/neighborsInterfaces';
import { NeighborFieldErrors } from '../../types/NeighborsTypes';

type EditableField = keyof UpdateNeighborPayloadType;

/** Declared once so the grid, the labels and the input modes stay in sync. */
const FIELDS: {
  field: EditableField;
  label: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  type?: string;
}[] = [
  { field: 'first_name', label: 'Primer Nombre' },
  { field: 'second_name', label: 'Segundo Nombre' },
  { field: 'last_name', label: 'Apellido' },
  { field: 'ci', label: 'Cédula de Identidad', inputMode: 'numeric' },
  { field: 'phone_number', label: 'Teléfono', inputMode: 'tel' },
  { field: 'email', label: 'Email', inputMode: 'email', type: 'email' },
];

type EditNeighborModalProps = {
  openModalState: boolean;
  handleCloseModal: () => void;
  neighbor: NeighborWithDetailsType | undefined;
  /** The working copy being edited; the page owns it. */
  values: UpdateNeighborPayloadType | undefined;
  errors: NeighborFieldErrors;
  onFieldChange: (
    field: EditableField,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isSaving?: boolean;
  /** False while nothing changed, so "save" stays out of reach. */
  canSave?: boolean;
};

const EditNeighborModal: React.FC<EditNeighborModalProps> = ({
  openModalState,
  handleCloseModal,
  neighbor,
  values,
  errors,
  onFieldChange,
  onSubmit,
  isSaving = false,
  canSave = true,
}) => {
  const fullName = `${neighbor?.first_name ?? ''} ${neighbor?.second_name ?? ''} ${neighbor?.last_name ?? ''}`
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <Dialog
      open={openModalState}
      handler={handleCloseModal}
      size='md'
      // The page keeps its own Esc/Cmd+Enter shortcuts while editing, and an
      // outside click must not silently drop what was typed.
      dismiss={{ escapeKey: false, outsidePress: false }}
    >
      <DialogHeader className='flex flex-col items-start gap-1 pb-2'>
        <Typography variant='h3' color='black'>
          Editar Datos del Vecino
        </Typography>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          {fullName}
        </Typography>
      </DialogHeader>

      <DialogBody className='pt-0'>
        <form
          className='flex flex-col gap-4'
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {FIELDS.map(({ field, label, inputMode, type }) => (
              <div key={field}>
                <Input
                  label={label}
                  type={type ?? 'text'}
                  inputMode={inputMode}
                  crossOrigin={undefined}
                  value={(values?.[field] as string | number | null) ?? ''}
                  onChange={onFieldChange(field)}
                  error={!!errors[field]}
                  disabled={isSaving}
                />
                {errors[field] && (
                  <Typography
                    variant='small'
                    color='red'
                    className='mt-1 font-normal'
                  >
                    {errors[field]}
                  </Typography>
                )}
              </div>
            ))}

            <Input
              label='Fecha de Nacimiento'
              crossOrigin={undefined}
              value={
                neighbor?.birth_day
                  ? new Date(neighbor.birth_day).toLocaleDateString('es-ES')
                  : '-'
              }
              // Read-only here: it is not part of the update payload.
              readOnly
              disabled
            />
          </div>

          <DialogFooter className='flex flex-col-reverse gap-2 px-0 pt-2 sm:flex-row'>
            <Button
              variant='outlined'
              color='red'
              onClick={handleCloseModal}
              className='w-full sm:w-auto'
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              color='green'
              variant='gradient'
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              disabled={isSaving || !canSave}
            >
              {isSaving && <ClipLoader size={16} color='white' />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default EditNeighborModal;
