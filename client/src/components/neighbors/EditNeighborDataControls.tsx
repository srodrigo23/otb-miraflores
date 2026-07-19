import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton, Tooltip, Typography } from "@material-tailwind/react";
import { CheckIcon, Loader2, PencilIcon } from "lucide-react";


const EditNeighborDataControls: React.FC<{
  edit: boolean;
  setEdit: (el: boolean) => void;
  updateNeighborDetail: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}> = ({ edit, setEdit, updateNeighborDetail, onCancel, isSaving = false, canSave = true }) => {
  return (
    <div className='flex items-center justify-between pb-3 px-4 lg:px-6'>
      <div className='flex items-center gap-2'>
        <Typography variant='h5' className='text-lg lg:text-xl'>Datos personales</Typography>
        {edit && (
          <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800'>
            Editando
          </span>
        )}
      </div>

      {!edit ? (
        <Tooltip content='Editar datos'>
          <IconButton
            size='sm'
            variant='outlined'
            color='blue-gray'
            onClick={() => setEdit(true)}
            aria-label='Editar datos del vecino'
          >
            <PencilIcon className='h-5 w-5' />
          </IconButton>
        </Tooltip>
      ) : (
        <div className='flex gap-1'>
          <Tooltip content='Cancelar'>
            <IconButton
              size='sm'
              variant='outlined'
              color='red'
              onClick={() => onCancel?.()}
              disabled={isSaving}
              aria-label='Cancelar edición'
            >
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </Tooltip>
          <Tooltip content={canSave ? 'Guardar cambios' : 'No hay cambios'}>
            <span>
              <IconButton
                size='sm'
                variant='filled'
                color='green'
                onClick={updateNeighborDetail}
                disabled={isSaving || !canSave}
                aria-label='Guardar cambios'
              >
                {isSaving ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <CheckIcon className='h-5 w-5' />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
export default EditNeighborDataControls;
