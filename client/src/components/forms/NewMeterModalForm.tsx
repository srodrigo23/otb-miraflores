import { useEffect } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  DialogHeader,
  Switch,
  Typography,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { getTodayDate } from '../../utils/dates';
import {
  InputsNewMeterForm,
  NewMeterModalFormType,
} from '../../types/NeighborsTypes';

const NewMeterModalForm: React.FC<NewMeterModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InputsNewMeterForm>({
    defaultValues: {
      meter_code: '',
      section: '',
      created_at: getTodayDate(),
      is_active: true,
      initial_reading: 0,
    },
  });

  // Start clean every time it closes, so a cancelled draft never reappears.
  useEffect(() => {
    if (!openModalState) reset();
  }, [openModalState, reset]);

  const onSubmitMethod: SubmitHandler<InputsNewMeterForm> = async (data) => {
    await onSubmit(data);
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
      size='sm'
      dismiss={{ escapeKey: false, outsidePress: false }}
    >
      <DialogHeader className='flex flex-col items-start gap-1 pb-2'>
        <Typography variant='h3' color='black'>
          Nuevo Medidor
        </Typography>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Registra un medidor para este vecino
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
                label='Código de Medidor'
                crossOrigin={undefined}
                {...register('meter_code', { required: true })}
                error={!!errors.meter_code}
              />
              {errors.meter_code && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  Campo requerido
                </Typography>
              )}
            </div>

            <div>
              <Input
                label='Sección'
                crossOrigin={undefined}
                {...register('section', { required: true })}
                error={!!errors.section}
              />
              {errors.section && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  Campo requerido
                </Typography>
              )}
            </div>

            <div>
              <Input
                type='date'
                label='Fecha de Creación'
                crossOrigin={undefined}
                {...register('created_at', { required: true })}
                error={!!errors.created_at}
              />
              {errors.created_at && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  Campo requerido
                </Typography>
              )}
            </div>

            <div>
              <Input
                type='number'
                inputMode='numeric'
                min={0}
                label='Lectura Inicial'
                crossOrigin={undefined}
                className='appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                {...register('initial_reading', {
                  required: true,
                  valueAsNumber: true,
                  min: { value: 0, message: 'No puede ser negativa' },
                })}
                error={!!errors.initial_reading}
              />
              {errors.initial_reading && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  {errors.initial_reading.message ?? 'Campo requerido'}
                </Typography>
              )}
            </div>
          </div>

          <Controller
            name='is_active'
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className='flex items-center justify-between rounded-lg border border-blue-gray-100 px-3 py-2'>
                <div>
                  <Typography
                    variant='small'
                    color='blue-gray'
                    className='font-semibold'
                  >
                    Estado del medidor
                  </Typography>
                  <Typography
                    variant='small'
                    color='gray'
                    className='font-normal'
                  >
                    {value
                      ? 'Habilitado: entra en las mediciones'
                      : 'Deshabilitado: queda fuera de las mediciones'}
                  </Typography>
                </div>
                <Switch
                  crossOrigin={undefined}
                  color='green'
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  aria-label='Habilitar medidor'
                />
              </div>
            )}
          />

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
              {isSubmitting ? 'Creando...' : 'Crear Medidor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewMeterModalForm;
