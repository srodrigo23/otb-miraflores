import { useEffect } from 'react';
import {
  Input,
  DialogBody,
  DialogFooter,
  Button,
  Dialog,
  DialogHeader,
  Option,
  Select,
  Switch,
  Typography,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { getTodayDate } from '../../utils/dates';
import { METER_SECTIONS } from '../../constants';
import { useNextMeterCodes } from '../../hooks/neighbors/useNextMeterCodes';
import {
  InputsNewMeterForm,
  NewMeterModalFormType,
} from '../../types/NeighborsTypes';

const NewMeterModalForm: React.FC<NewMeterModalFormType> = ({
  openModalState,
  handleCloseModal,
  onSubmit,
}) => {
  // One request per opening: the map holds the next free code of every
  // section, so switching section does not hit the API again.
  const { codes, isLoading: loadingCodes } = useNextMeterCodes(openModalState);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
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

  const section = watch('section');

  // Start clean every time it closes, so a cancelled draft never reappears.
  useEffect(() => {
    if (!openModalState) reset();
  }, [openModalState, reset]);

  // Keeps the code in step with the section, and fills it in when the codes
  // land after a section was already picked.
  useEffect(() => {
    setValue('meter_code', section ? (codes[section] ?? '') : '');
  }, [section, codes, setValue]);

  const onSubmitMethod: SubmitHandler<InputsNewMeterForm> = async (data) => {
    const created = await onSubmit(data);
    // Keep the modal open on failure (a code taken meanwhile, for instance)
    // so the user can react instead of retyping everything.
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
            {/* Section comes first: the code is derived from it */}
            <div>
              <Controller
                name='section'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    label='Sección'
                    value={value}
                    onChange={(val) => onChange(val ?? '')}
                    error={!!errors.section}
                    disabled={loadingCodes}
                  >
                    {METER_SECTIONS.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                )}
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
                label='Código de Medidor'
                crossOrigin={undefined}
                {...register('meter_code', { required: true })}
                error={!!errors.meter_code}
                // Assigned by the correlative, not typed: letting it be edited
                // is what would produce a duplicate of a code already in use.
                readOnly
                className='!bg-blue-gray-50/60'
              />
              <Typography
                variant='small'
                color='gray'
                className='mt-1 font-normal'
              >
                {loadingCodes
                  ? 'Buscando el siguiente código...'
                  : section
                    ? 'Siguiente código libre de la sección'
                    : 'Elige una sección para asignarlo'}
              </Typography>
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
