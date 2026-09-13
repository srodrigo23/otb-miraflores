import {
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface NeighborType {
  id: number;
  names: string;
  mat_lname: string;
  pat_lname: string;
  ci: string;
  phone_number: string;
  email: string;
}

type DeleteNeighborModalType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  neighbor: NeighborType | null;
  onConfirmDelete: () => void;
};

const DeleteNeighborModal: React.FC<DeleteNeighborModalType> = ({
  openModalState,
  handleCloseModal,
  neighbor,
  onConfirmDelete,
}) => {
  const handleDelete = () => {
    onConfirmDelete();
    handleCloseModal();
  };

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
          ¿Eliminar Vecino?
        </Typography>
        <Typography color='gray' className='mb-4 font-normal'>
          ¿Estás seguro que deseas eliminar al vecino{' '}
          <span className='font-semibold'>
            {neighbor?.pat_lname} {neighbor?.mat_lname} {neighbor?.names}
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
        <Button variant='gradient' color='red' onClick={handleDelete}>
          <span>Eliminar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteNeighborModal;
