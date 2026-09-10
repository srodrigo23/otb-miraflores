import {
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MeasureType } from '../../interfaces/measuresIterfaces';

type DeleteNeighborModalType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  measure: MeasureType | null;
  onConfirmDelete: () => void;
};

const DeleteMeasureConfirmationModal: React.FC<DeleteNeighborModalType> = ({
  openModalState,
  handleCloseModal,
  measure,
  onConfirmDelete,
}) => {

  return (
    <Dialog open={openModalState} handler={handleCloseModal} size='sm'>
      <DialogBody className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
          <ExclamationTriangleIcon
            className='h-8 w-8 text-red-500'
            strokeWidth={2}
          />
        </div>
        <Typography variant='h4' color='blue-gray' className='mb-2'>
          ¿Eliminar Medición?
        </Typography>
        <Typography color='gray' className='mb-4 font-normal'>
          ¿Estás seguro que deseas eliminar la lecturacion{' '}
          <span className='font-semibold'>
            {measure?.measure_date}
            {/* {neighbor?.first_name} {neighbor?.second_name} {neighbor?.last_name} */}
          </span>
          ?
        </Typography>
        <Typography color='gray' className='font-normal text-sm'>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogBody>
      <DialogFooter className='justify-center gap-2'>
        <Button variant='outlined' color='blue-gray' onClick={handleCloseModal}>
          <span>Cancelar</span>
        </Button>
        <Button variant='gradient' color='red' onClick={onConfirmDelete}>
          <span>Eliminar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteMeasureConfirmationModal;
