import {
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
} from '@material-tailwind/react';
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
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='h-8 w-8 text-red-500'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
            />
          </svg>
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
