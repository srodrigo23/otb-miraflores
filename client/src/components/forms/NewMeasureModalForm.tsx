import { useEffect, useState } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  DialogHeader,
  Textarea,
  Select,
  Option,
  Typography,
} from '@material-tailwind/react';

import { ClipLoader } from 'react-spinners';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { getTodayDate } from '../../utils/dates';
import { useAuth } from '../../context/AuthContext';
import { NewMeasureModalFormType } from '../../types/MeasuresTypes';
import { InputsNewMeasureForm } from '../../types/MeasuresTypes';

const periods = [
  'ENERO-FEBRERO',
  'MARZO-ABRIL',
  'MAYO-JUNIO',
  'JULIO-AGOSTO',
  'SEPTIEMBRE-OCTUBRE',
  'NOVIEMBRE-DICIEMBRE',
];

const NewMeasureModalForm: React.FC<NewMeasureModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InputsNewMeasureForm>();

  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  useEffect(() => {
    if (!openModalState) {
      const today = getTodayDate();
      setSelectedDate(today);
      reset();
    }
  }, [openModalState, reset]);

  useEffect(() => {
    const month = new Date(`${selectedDate} 00:00:00`).getMonth();
    const periodIndex = Math.floor(month / 2);
    setValue('period', periods[periodIndex]);
  }, [selectedDate, setValue]);

  const onSubmitMethod: SubmitHandler<InputsNewMeasureForm> = async (data) => {
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
          Nueva Medición
        </Typography>
        <Typography variant='small' color='blue-gray' className='font-normal'>
          Gestión - {new Date().getFullYear()}
        </Typography>
      </DialogHeader>
      <DialogBody className='pt-0'>
        <form
          className='flex flex-col gap-4'
          onSubmit={handleSubmit(onSubmitMethod)}
        >
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Input
                type='date'
                label='Fecha de Medición'
                defaultValue={selectedDate}
                crossOrigin={undefined}
                {...register('measure_date', { required: true })}
                onChange={(e) => setSelectedDate(e.target.value)}
                error={!!errors.measure_date}
              />
              {errors.measure_date && (
                <Typography
                  variant='small'
                  color='red'
                  className='mt-1 font-normal'
                >
                  Campo requerido
                </Typography>
              )}
            </div>

            <Controller
              name='period'
              control={control}
              defaultValue={periods[0]}
              render={({ field: { onChange, value } }) => (
                <Select
                  label='Periodo'
                  value={value}
                  onChange={(val) => onChange(val || '')}
                  error={!!errors.period}
                >
                  {periods.map((period) => (
                    <Option key={period} value={period}>
                      {period}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.period && (
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
              label='Nombre del Responsable'
              crossOrigin={undefined}
              defaultValue={`${user?.first_name?.toUpperCase() ?? ''} ${user?.last_name?.toUpperCase() ?? ''}`}
              disabled
              {...register('reader_name', { required: true })}
              error={!!errors.reader_name}
            />
            {errors.reader_name && (
              <Typography
                variant='small'
                color='red'
                className='mt-1 font-normal'
              >
                Nombre requerido
              </Typography>
            )}
          </div>

          <div>
            <Textarea
              label='Observaciones'
              {...register('notes', {
                maxLength: {
                  value: 200,
                  message:
                    'Las observaciones no deben exceder de 200 caracteres',
                },
              })}
              error={!!errors.notes}
            />
            {errors.notes && (
              <Typography
                variant='small'
                color='red'
                className='mt-1 font-normal'
              >
                {errors.notes.message}
              </Typography>
            )}
          </div>

          <DialogFooter className='flex flex-col-reverse sm:flex-row px-0 pt-2 gap-2'>
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
              className='w-full sm:w-auto flex items-center justify-center gap-2'
              disabled={isSubmitting}
            >
              {isSubmitting && <ClipLoader size={16} />}
              {isSubmitting ? 'Creando...' : 'Crear Medición'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewMeasureModalForm;
