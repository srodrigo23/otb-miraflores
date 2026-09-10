import {
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';

type DeactivateMeterModalType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  /** Code of the meter about to be disabled, shown so the user can check it */
  meterCode: string | undefined;
  onConfirmDeactivate: () => void;
  isSaving?: boolean;
};

const DeactivateMeterModal: React.FC<DeactivateMeterModalType> = ({
  openModalState,
  handleCloseModal,
  meterCode,
  onConfirmDeactivate,
  isSaving = false,
}) => {
  return (
    <Dialog open={openModalState} handler={handleCloseModal} size='sm'>
      <DialogBody className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100'>
          <ExclamationTriangleIcon
            className='h-8 w-8 text-amber-600'
            strokeWidth={2}
          />
        </div>
        <Typography variant='h4' color='blue-gray' className='mb-2'>
          ¿Deshabilitar Medidor?
        </Typography>
        <Typography color='gray' className='mb-4 font-normal'>
          ¿Estás seguro que deseas deshabilitar el medidor{' '}
          <span className='font-semibold'>{meterCode}</span>?
        </Typography>
        <Typography color='gray' className='font-normal text-sm'>
          Dejará de incluirse en las próximas mediciones. Puedes volver a
          habilitarlo cuando lo necesites.
        </Typography>
      </DialogBody>
      <DialogFooter className='justify-center gap-2'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={handleCloseModal}
          disabled={isSaving}
        >
          <span>Cancelar</span>
        </Button>
        <Button
          variant='gradient'
          color='red'
          onClick={onConfirmDeactivate}
          disabled={isSaving}
          className='flex items-center justify-center gap-2'
        >
          {isSaving && <ClipLoader size={16} color='white' />}
          <span>{isSaving ? 'Deshabilitando...' : 'Deshabilitar'}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeactivateMeterModal;
