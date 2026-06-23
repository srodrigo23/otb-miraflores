import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  Typography,
  Textarea,
  Checkbox,
  Select,
  Option,
} from '@material-tailwind/react';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';

type InputsNewMeetForm = {
  meetDate: string;
  meetType: string;
  title: string;
  description: string;
  location: string;
  isMandatory: boolean;
  organizer: string;
  notes: string;
};

type NewMeetModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  onSubmit: (data: InputsNewMeetForm) => void;
};

const NewMeetModalForm: React.FC<NewMeetModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InputsNewMeetForm>({
    defaultValues: {
      isMandatory: false,
      meetType: 'ordinary',
    },
  });

  const onSubmitMethod: SubmitHandler<InputsNewMeetForm> = (data) => {
    onSubmit(data);
    reset();
    handleCloseModal();
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  // Obtener la fecha y hora actual en formato YYYY-MM-DDTHH:MM
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={openModalState} handler={handleClose} size="lg">
      <DialogBody>
        <form
          className='flex flex-col gap-5 mx-4'
          onSubmit={handleSubmit(onSubmitMethod)}
        >
          <Typography variant='h2' color='black'>
            Nueva Reunión
          </Typography>

          <div className='flex gap-5'>
            <div className='flex-1'>
              <Input
                type='datetime-local'
                label='Fecha y Hora'
                defaultValue={getCurrentDateTime()}
                crossOrigin={undefined}
                {...register('meetDate', { required: true })}
              />
              {errors.meetDate && (
                <span className='text-red-400 text-xs'>Campo requerido</span>
              )}
            </div>

            <div className='flex-1'>
              <Controller
                name="meetType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label='Tipo de Reunión'
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  >
                    <Option value='ordinary'>Ordinaria</Option>
                    <Option value='extraordinary'>Extraordinaria</Option>
                    <Option value='emergency'>Emergencia</Option>
                    <Option value='informative'>Informativa</Option>
                  </Select>
                )}
              />
              {errors.meetType && (
                <span className='text-red-400 text-xs'>Campo requerido</span>
              )}
            </div>
          </div>

          <div>
            <Input
              label='Título de la Reunión'
              crossOrigin={undefined}
              {...register('title', { required: true })}
            />
            {errors.title && (
              <span className='text-red-400 text-xs'>Campo requerido</span>
            )}
          </div>

          <div>
            <Textarea
              label='Descripción'
              {...register('description')}
            />
          </div>

          <div className='flex gap-5'>
            <div className='flex-1'>
              <Input
                label='Lugar'
                crossOrigin={undefined}
                {...register('location')}
              />
            </div>

            <div className='flex-1'>
              <Input
                label='Organizador'
                crossOrigin={undefined}
                {...register('organizer')}
              />
            </div>
          </div>

          <div>
            <Controller
              name="isMandatory"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label='Asistencia Obligatoria'
                  checked={field.value}
                  onChange={field.onChange}
                  crossOrigin={undefined}
                />
              )}
            />
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
              <span>Crear Reunión</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewMeetModalForm;
