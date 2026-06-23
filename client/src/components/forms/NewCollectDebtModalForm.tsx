import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
  Textarea,
} from '@material-tailwind/react';

import { useForm, SubmitHandler } from 'react-hook-form';

type InputsNewCollectDebtForm = {
  collectDate: string;
  period: string;
  collectorName: string;
  location: string;
  notes: string;
};

type NewCollectDebtModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  onSubmit: (data: InputsNewCollectDebtForm) => void;
};

const NewCollectDebtModalForm: React.FC<NewCollectDebtModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputsNewCollectDebtForm>({
    defaultValues: {},
  });

  const onSubmitMethod: SubmitHandler<InputsNewCollectDebtForm> = (data) => {
    onSubmit(data);
    reset();
    handleCloseModal();
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Obtener el periodo actual en formato YYYY-MM
  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <Dialog open={openModalState} handler={handleClose} size="lg">
      <DialogBody>
        <form
          className='flex flex-col gap-5 mx-4'
          onSubmit={handleSubmit(onSubmitMethod)}
        >
          <Typography variant='h2' color='black'>
            Nueva Recaudación
          </Typography>

          <div className='flex gap-5'>
            <div className='flex-1'>
              <Input
                type='date'
                label='Fecha de Recaudación'
                defaultValue={getCurrentDate()}
                crossOrigin={undefined}
                {...register('collectDate', { required: true })}
              />
              {errors.collectDate && (
                <span className='text-red-400 text-xs'>Campo requerido</span>
              )}
            </div>

            <div className='flex-1'>
              <Input
                label='Periodo (ej: 2025-01)'
                defaultValue={getCurrentPeriod()}
                crossOrigin={undefined}
                {...register('period')}
                placeholder='YYYY-MM'
              />
            </div>
          </div>

          <div className='flex gap-5'>
            <div className='flex-1'>
              <Input
                label='Nombre del Cobrador'
                crossOrigin={undefined}
                {...register('collectorName')}
              />
            </div>

            <div className='flex-1'>
              <Input
                label='Lugar de Recaudación'
                crossOrigin={undefined}
                {...register('location')}
              />
            </div>
          </div>

          <div>
            <Textarea
              label='Notas u Observaciones'
              {...register('notes')}
            />
          </div>

          <DialogFooter className='px-0'>
            <Button
              variant='text'
              color='red'
              onClick={handleClose}
              className='mr-1'
            >
              <span>Cancelar</span>
            </Button>
            <Button variant='gradient' color='green' type='submit'>
              <span>Crear Recaudación</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewCollectDebtModalForm;
