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

import { useForm, SubmitHandler } from 'react-hook-form';
import { getTodayDate } from '../../utils/dates';
// import useFormNewMeasure from '../../hooks/useFormNewMeasure';

type InputsNewMeasureForm = {
  measureDate: string;
  period: string;
  readerName: string;
  notes: string;
};

type NewMeasureModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  onSubmit: (data: InputsNewMeasureForm) => void;
};

const NewMeasureModalForm: React.FC<NewMeasureModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputsNewMeasureForm>();

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
            <Typography color='black'>Gestión - {new Date().getFullYear()}</Typography>
          </DialogHeader>
          <div className='flex flex-col sm:flex-row  gap-3'>
            <Input
              type='date'
              label='Fecha de Medición'
              defaultValue={selectedDate}
              crossOrigin={undefined}
              {...register('measureDate', { required: true })}
              onChange={(event) => {
                setSelectedDate(event.target.value);
              }}
            />
            {errors.measureDate && (
              <span className='text-red-400 text-xs'>Campo requerido</span>
            )}

            <Select
              label='Periodo'
              value={periods[selectedPeriod]}
              onChange={() => {
                // const measureToChange = getMeasureByPeriod(val);
                // if (measureToChange) {
                //   setSelectedMeasure(measureToChange);
                // }
              }}
            >
              {periods.map((period, index) => (
                <Option key={index} value={period}>
                  {`${index + 1}.- ${period}`}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label='Nombre del Responsable'
              crossOrigin={undefined}
              {...register('readerName', { required: true })}
            />
            {errors.readerName && (
              <span className='text-red-400 text-xs pl-2'>
                Nombre requerido
              </span>
            )}
          </div>

          <Textarea label='Observaciones' {...register('notes')} />

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
