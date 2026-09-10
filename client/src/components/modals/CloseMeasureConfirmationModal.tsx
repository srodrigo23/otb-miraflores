import {
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
} from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MeasureType } from '../../interfaces/measuresIterfaces';

type CloseMeasureConfirmationModalType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  measure: MeasureType | null | undefined;
  onConfirmClose: () => void;
};

const CloseMeasureConfirmationModal: React.FC<
  CloseMeasureConfirmationModalType
> = ({ openModalState, handleCloseModal, measure, onConfirmClose }) => {
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
          ¿Cerrar Llenado?
        </Typography>
        <Typography color='gray' className='mb-4 font-normal'>
          ¿Estás seguro que deseas cerrar la lecturación del periodo{' '}
          <span className='font-semibold'>{measure?.period}</span>?
        </Typography>
        <Typography color='gray' className='font-normal text-sm'>
          Ya no se podrán cargar ni modificar lecturas. Esta acción no se puede
          deshacer.
        </Typography>
      </DialogBody>
      <DialogFooter className='justify-center gap-2'>
        <Button variant='outlined' color='blue-gray' onClick={handleCloseModal}>
          <span>Cancelar</span>
        </Button>
        <Button variant='gradient' color='red' onClick={onConfirmClose}>
          <span>Cerrar Llenado</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CloseMeasureConfirmationModal;
