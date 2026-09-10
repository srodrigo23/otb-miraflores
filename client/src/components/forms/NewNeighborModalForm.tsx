import { useEffect } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  DialogHeader,
  Typography,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';
import { useForm, SubmitHandler } from 'react-hook-form';

import {
  InputsNewNeighborForm,
  NewNeighborModalFormType,
} from '../../types/NeighborsTypes';

const NAME_PATTERN = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Empty text inputs must reach the API as null, not as "" */
const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

/** Digits typed into a text field, as the numeric columns expect them */
const digitsToNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
};

const NewNeighborModalForm: React.FC<NewNeighborModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<keyof InputsNewNeighborForm, string>>();

  // Start clean every time it closes, so a cancelled draft never reappears.
  useEffect(() => {
    if (!openModalState) reset();
  }, [openModalState, reset]);

  const onSubmitMethod: SubmitHandler<
    Record<keyof InputsNewNeighborForm, string>
  > = async (form) => {
    const created = await onSubmit({
      first_name: form.first_name.trim(),
      second_name: emptyToNull(form.second_name),
      last_name: form.last_name.trim(),
      ci: digitsToNumber(form.ci),
      phone_number: digitsToNumber(form.phone_number),
      email: emptyToNull(form.email),
    });

    // Keep the modal open on failure (duplicated CI, for instance) so the
    // user can correct the field instead of retyping everything.
    if (!created) return;
    reset();
    handleCloseModal();
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  return (
    <Dialog
      open={openModalState}
      handler={handleClose}
      size='md'
      dismiss={{ escapeKey: false, outsidePress: false }}
    >
      <DialogHeader className='flex flex-col items-start gap-1 pb-2'>
        <Typography variant='h3' color='black'>
          Nuevo Vecino
        </Typography>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Los medidores se registran aparte, desde el detalle del vecino
        </Typography>
      </DialogHeader>

      <DialogBody className='pt-0'>
        <form
          className='flex flex-col gap-4'
          onSubmit={handleSubmit(onSubmitMethod)}
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Input
                label='Primer Nombre *'
                crossOrigin={undefined}
                {...register('first_name', {
                  required: 'Campo requerido',
                  pattern: {
                    value: NAME_PATTERN,
                    message: 'Solo letras y espacios',
                  },
                })}
                error={!!errors.first_name}
              />
              {errors.first_name && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.first_name.message}
                </Typography>
              )}
            </div>

            <div>
              <Input
                label='Segundo Nombre'
                crossOrigin={undefined}
                {...register('second_name', {
                  pattern: {
                    value: NAME_PATTERN,
                    message: 'Solo letras y espacios',
                  },
                })}
                error={!!errors.second_name}
              />
              {errors.second_name && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.second_name.message}
                </Typography>
              )}
            </div>

            <div className='sm:col-span-2'>
              <Input
                label='Apellidos *'
                crossOrigin={undefined}
                {...register('last_name', {
                  required: 'Campo requerido',
                  pattern: {
                    value: NAME_PATTERN,
                    message: 'Solo letras y espacios',
                  },
                })}
                error={!!errors.last_name}
              />
              {errors.last_name && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.last_name.message}
                </Typography>
              )}
            </div>

            <div>
              <Input
                label='Cédula de Identidad'
                inputMode='numeric'
                crossOrigin={undefined}
                {...register('ci', {
                  pattern: { value: /^\d*$/, message: 'Solo números' },
                })}
                error={!!errors.ci}
              />
              {errors.ci && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.ci.message}
                </Typography>
              )}
            </div>

            <div>
              <Input
                label='Celular'
                inputMode='tel'
                crossOrigin={undefined}
                {...register('phone_number', {
                  pattern: { value: /^\d*$/, message: 'Solo números' },
                })}
                error={!!errors.phone_number}
              />
              {errors.phone_number && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.phone_number.message}
                </Typography>
              )}
            </div>

            <div className='sm:col-span-2'>
              <Input
                label='Correo Electrónico'
                type='email'
                inputMode='email'
                crossOrigin={undefined}
                {...register('email', {
                  pattern: {
                    value: EMAIL_PATTERN,
                    message: 'Correo electrónico no válido',
                  },
                })}
                error={!!errors.email}
              />
              {errors.email && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.email.message}
                </Typography>
              )}
            </div>
          </div>

          <Typography variant='small' color='gray' className='font-normal'>
            * Campos obligatorios
          </Typography>

          <DialogFooter className='flex flex-col-reverse gap-2 px-0 pt-2 sm:flex-row'>
            <Button
              variant='outlined'
              color='red'
              onClick={handleClose}
              className='w-full sm:w-auto'
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              disabled={isSubmitting}
            >
              {isSubmitting && <ClipLoader size={16} color='white' />}
              {isSubmitting ? 'Creando...' : 'Crear Vecino'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewNeighborModalForm;
