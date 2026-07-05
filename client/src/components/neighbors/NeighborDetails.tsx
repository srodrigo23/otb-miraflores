import { useState, useEffect, ChangeEvent } from 'react';
import { useNeighborDetailsData } from '../../hooks/useNeighborsData';
import { LoaderAnimation } from '../shared/LoaderAnimation';
import { toast } from 'react-toastify';
import { InfoField } from './InfoField';

import {
  Card,
  CardBody,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '@material-tailwind/react';

import { NeighborDebtsPayments } from '../NeighborDebtsPayments';
import { useUpdateNeighbor } from '../../hooks/useUpdateNeighbor';
import { UpdateNeighborPayloadType } from '../../interfaces/neighborsInterfaces';
import NeighborDataCard from './NeighborDataCard';
import EditNeighborDataControls from './EditNeighborDataControls';

type FieldErrors = Partial<Record<keyof UpdateNeighborPayloadType, string>>;

export const NeighborDetails: React.FC<{
  neighborId: number | undefined;
  refetchNeighbors: () => void;
}> = ({ neighborId, refetchNeighbors }) => {

  const [openInfo, setOpenInfo] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);

  const { data, isLoading, error } = useNeighborDetailsData(neighborId);
  const [toUpdateDataNeighbor, setToUpdateDataNeighbor] = useState<UpdateNeighborPayloadType>();
  const { update } = useUpdateNeighbor(data?.id);

  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (data) {
      const { id: _, ...rest } = data;
      setToUpdateDataNeighbor(rest);
      setErrors({});
    }
  }, [data]);

  const handleFieldChange =
    (field: keyof UpdateNeighborPayloadType) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setToUpdateDataNeighbor((prev) =>
        prev ? { ...prev, [field]: e.target?.value || null } : prev,
      );
    };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!toUpdateDataNeighbor?.first_name?.trim()) {
      newErrors.first_name = 'El primer nombre es requerido';
    }
    if (!toUpdateDataNeighbor?.last_name?.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateNeighborDetail = async () => {
    if (!toUpdateDataNeighbor) return;
    if (!validate()) {
      toast.warning('Corrige los campos resaltados antes de guardar');
      return;
    }
    await update(toUpdateDataNeighbor).then((data) => {
      if (data?.ok) {
        toast.success('Datos del vecino editados correctamente');
      } else {
        toast.error('A ocurrido un error al editar los datos');
      }
    });
    refetchNeighbors();
    setEdit(false);
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (data) {
      const { id: _, ...rest } = data;
      setToUpdateDataNeighbor(rest);
    }
    setEdit(false);
  };

  if (isLoading) return <LoaderAnimation />;
  if (error) return <>{error}</>;

  return (
    <div className='mx-auto container w-full flex flex-col gap-4 lg:gap-6 h-full py-3 px-3 lg:px-3'>
      <div>
        <Card className='w-full shadow-sm p-0'>
          <CardBody className='p-0'>
            <Accordion open={openInfo} className='py-0'>
              <AccordionHeader
                className='flex justify-center px-4 lg:px-6'
                onClick={() => {
                  setOpenInfo(!openInfo);
                  handleCancelEdit();
                }}
              >
                <NeighborDataCard neighborData={data}/>
              </AccordionHeader>
              <AccordionBody>
                <EditNeighborDataControls
                  edit={edit}
                  setEdit={setEdit}
                  updateNeighborDetail={updateNeighborDetail}
                  onCancel={handleCancelEdit}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-5 lg:gap-y-4 px-4 lg:px-6 pb-6'>
                  <InfoField
                    label='Primer Nombre'
                    value={toUpdateDataNeighbor?.first_name}
                    isInput={edit}
                    onChange={handleFieldChange('first_name')}
                    error={errors.first_name}
                  />
                  <InfoField
                    label='Segundo Nombre'
                    value={toUpdateDataNeighbor?.second_name || ''}
                    isInput={edit}
                    onChange={handleFieldChange('second_name')}
                  />
                  <InfoField
                    label='Apellido'
                    value={toUpdateDataNeighbor?.last_name}
                    isInput={edit}
                    onChange={handleFieldChange('last_name')}
                    error={errors.last_name}
                  />
                  <InfoField
                    label='Cédula de Identidad'
                    value={toUpdateDataNeighbor?.ci || ''}
                    isInput={edit}
                    onChange={handleFieldChange('ci')}
                  />
                  <InfoField
                    label='Teléfono'
                    value={toUpdateDataNeighbor?.phone_number || ''}
                    isInput={edit}
                    onChange={handleFieldChange('phone_number')}
                  />
                  <InfoField
                    label='Email'
                    value={toUpdateDataNeighbor?.email || ''}
                    isInput={edit}
                    onChange={handleFieldChange('email')}
                  />
                  <InfoField
                    label='Fecha de Nacimiento'
                    value={
                      data?.birth_day
                        ? new Date(data.birth_day).toLocaleDateString('es-ES')
                        : '-'
                    }
                    isInput={false}
                  />
                </div>
              </AccordionBody>
            </Accordion>
          </CardBody>
        </Card>
      </div>

      <NeighborDebtsPayments />

    </div>
  );
};
