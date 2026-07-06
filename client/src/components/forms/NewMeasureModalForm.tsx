import { useEffect, useState } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  DialogHeader,
  Textarea,
  Select, Option, Typography
} from '@material-tailwind/react';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { getTodayDate } from '../../utils/dates';
import { useAuth } from '../../context/AuthContext';
import { NewMeasureModalFormType } from '../../types/MeasuresTypes';
import { InputsNewMeasureForm } from '../../types/MeasuresTypes';

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
    formState: { errors },
  } = useForm<InputsNewMeasureForm>();

  const {user} = useAuth()

  const periods = ["ENERO-FEBRERO", "MARZO-ABRIL", "MAYO-JUNIO", "JULIO-AGOSTO", "SEPTIEMBRE-OCTUBRE", "NOVIEMBRE-DICIEMBRE"]
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate())
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0)

  useEffect(() => {
    const selectedMonth = new Date(`${selectedDate} 00:00:00`).getMonth();
    setSelectedPeriod(Math.floor(selectedMonth / 2));
  }, [selectedPeriod, selectedDate]);

  // const {handleSubmit:handleSubmitLocalMethod, loading} = useFormNewMeasure()

  const onSubmitMethod: SubmitHandler<InputsNewMeasureForm> = (data) => {
    onSubmit(data);
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
      size='xs'
      dismiss={{ escapeKey: false, outsidePress: false }}
    >
      <DialogBody>
        <form
          className='flex flex-col gap-3'
          onSubmit={handleSubmit(onSubmitMethod)}
        >
          <DialogHeader className='flex flex-col py-0'>
            <Typography variant='h3' color='black'>
              Nueva Medición
            </Typography>
            <Typography color='black'>
              Gestión - {new Date().getFullYear()}
            </Typography>
          </DialogHeader>
          <div className='flex flex-col sm:flex-row  gap-3'>
            <Input
              type='date'
              label='Fecha de Medición'
              defaultValue={selectedDate}
              crossOrigin={undefined}
              {...register('measure_date', { required: true })}
              onChange={(event) => {
                setSelectedDate(event.target.value);
              }}
            />
            {errors.measure_date && (
              <span className='text-red-400 text-xs'>Campo requerido</span>
            )}

            <Controller
              name='period'
              control={control}
              defaultValue={periods[selectedPeriod]}
              render={({ field: { onChange, value } }) => (
                <Select
                  label='Periodo'
                  value={value}
                  onChange={(val) => {
                    onChange(val || '');
                  }}
                >
                  {periods.map((period, index) => (
                    <Option key={index} value={period}>
                      {`${index + 1}.- ${period}`}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div>
            <Input
              label='Nombre del Responsable'
              crossOrigin={undefined}
              value={`${user?.first_name.toUpperCase()} ${user?.last_name.toUpperCase()}`}
              {...register('reader_name', { required: true })}
            />
            {errors.reader_name && (
              <span className='text-red-400 text-xs pl-2'>
                Nombre requerido
              </span>
            )}
          </div>
          <div className='flex flex-col gap-0'>
            <Textarea
              label='Observaciones'
              {...register('notes', {
                maxLength: {
                  value: 200,
                  message:
                    'Las observaciones no deben exceder de 200 caracteres',
                },
              })}
            />
            {errors.notes && (
              <span className='text-red-400 text-xs pl-2'>
                {errors.notes.message}
              </span>
            )}
          </div>

          <DialogFooter className='px-0 py-0'>
            <Button
              variant='outlined'
              color='red'
              onClick={handleClose}
              className='mr-1'
              size='sm'
            >
              <span>Cancelar</span>
            </Button>
            <Button type='submit' size='sm'>
              <span>Crear Medición</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
};

export default NewMeasureModalForm;
