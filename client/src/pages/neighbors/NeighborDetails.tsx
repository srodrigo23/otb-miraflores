import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNeighborDetailsData } from '../../hooks/useNeighborsData';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { toast } from 'react-toastify';


import {
  Button, Card, CardBody, 
  // Chip,
  Accordion, AccordionHeader, AccordionBody,
} from '@material-tailwind/react';
import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';
import { ArrowLongLeftIcon } from '@heroicons/react/24/outline';

import { Typography, IconButton } from '@material-tailwind/react';
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUpdateNeighbor } from '../../hooks/useUpdateNeighbor';
import { UpdateNeighborPayloadType } from '../../interfaces/neighborsInterfaces';

function InfoField({ label, value, isInput, onChange }: { label: string; value?: number |string| undefined; isInput: boolean; onChange?: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <div className='font-semibold  text-gray-500'>{label}</div>
      {isInput ? (
        <input type='text' className='text-2xl border border-blue-600 rounded-lg px-2' value={value} onChange={onChange}/>
      ) : (
        <div className='text-2xl '>{value || '-'}</div>
      )}
    </div>
  );
}

export const NeighborDetails:React.FC<{neighborId:number|undefined; refetchNeighbors:()=>void}>=({neighborId, refetchNeighbors}) =>{
  
  const [openInfo, setOpenInfo] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const navigate = useNavigate()

  const { data, isLoading, error } = useNeighborDetailsData(neighborId);
  const [toUpdateDataNeighbor, setToUpdateDataNeighbor] = useState<UpdateNeighborPayloadType>();

  useEffect(() => {
    if (data) {
      const { id:_, ...rest } = data;
      setToUpdateDataNeighbor(rest);
    }
  }, [data]);

  const {update} = useUpdateNeighbor(data?.id)

  const handleFieldChange = (field: keyof UpdateNeighborPayloadType) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setToUpdateDataNeighbor(prev => prev ? { ...prev, [field]: e.target?.value || null } : prev);
    };

  const updateNeighborDetail = async () => {
    if (!toUpdateDataNeighbor) return;
    await update(toUpdateDataNeighbor).then(
      (data)=>{
        if(data?.ok){
          toast.success('Datos del vecino editados correctamente');
        }else{
          toast.error('A ocurrido un error al editar los datos');
        }
      }
    );
    refetchNeighbors();
    setEdit(false);
  };

  if(isLoading) return <LoaderAnimation/>;
  if(error) return<>{error}</>
  
  return (
    <div className='mx-auto container w-full flex flex-col gap-6 h-full py-3 px-3 lg:px-3'>
      <div>
        <Button
          onClick={() => navigate('/vecinos')}
          className='flex gap-1 items-center px-3 mb-2'
          variant='outlined'
          size='sm'
        >
          <ArrowLongLeftIcon className='w-5 h-5' /> Volver
        </Button>
        <Card className='w-full shadow-sm p-0'>
          <CardBody className='p-0'>
            <Accordion open={openInfo} className='py-0'>
              <AccordionHeader
                className='flex  justify-center '
                onClick={() => {
                  setOpenInfo(!openInfo)
                  setEdit(false)
                }}
              >
                <div className='flex items-center gap-5 py-3'>
                  <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md'>
                    {data?.first_name?.[0]}
                    {data?.last_name?.[0]}
                  </div>
                  <div>
                    <div className='text-2xl lg:text-4xl'>
                      {data?.first_name} {data?.second_name} {data?.last_name}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      {/* <Chip
                        size='sm'
                        value={data?.section || 'Sin sección'}
                        color='blue'
                        variant='ghost'
                      /> */}
                      <Typography variant='small' color='gray'>
                        CI: {data?.ci}
                      </Typography>
                    </div>
                  </div>
                </div>
              </AccordionHeader>
              <AccordionBody>
                <div className='flex justify-between pb-3 px-6'>
                  <Typography variant='h4'>Datos personales</Typography>
                  {!edit ? (
                    <IconButton
                      size='sm'
                      variant='outlined'
                      color='blue-gray'
                      onClick={() => setEdit(true)}
                    >
                      <PencilIcon className='h-5 w-5' />
                    </IconButton>
                  ) : (
                    <div className='flex gap-1'>
                      <IconButton
                        size='sm'
                        variant='filled'
                        color='red'
                        onClick={() => setEdit(false)}
                      >
                        <XMarkIcon className='h-5 w-5' />
                      </IconButton>
                      <IconButton size='sm' variant='filled' color='green' onClick={updateNeighborDetail}>
                        <CheckIcon className='h-5 w-5' />
                      </IconButton>
                    </div>
                  )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 px-6'>
                  <InfoField
                    label='Primer Nombre'
                    value={toUpdateDataNeighbor?.first_name}
                    isInput={edit}
                    onChange={handleFieldChange('first_name')}
                  />
                  <InfoField
                    label='Segundo Nombre'
                    value={toUpdateDataNeighbor?.second_name||''}
                    isInput={edit}
                    onChange={handleFieldChange('second_name')}
                  />
                  <InfoField
                    label='Apellido'
                    value={toUpdateDataNeighbor?.last_name}
                    isInput={edit}
                    onChange={handleFieldChange('last_name')}
                  />
                  <InfoField
                    label='Cédula de Identidad'
                    value={toUpdateDataNeighbor?.ci||''}
                    isInput={edit}
                    onChange={handleFieldChange('ci')}
                  />
                  <InfoField
                    label='Teléfono'
                    value={toUpdateDataNeighbor?.phone_number||''}
                    isInput={edit}
                    onChange={handleFieldChange('phone_number')}
                  />
                  <InfoField 
                    label='Email' 
                    value={toUpdateDataNeighbor?.email||''} 
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
                  {/* <InfoField
                    label='Sección'
                    value={data?.section}
                    isInput={false}
                  /> */}
                </div>
              </AccordionBody>
            </Accordion>
          </CardBody>
        </Card>
      </div>

      {/* <div className='border rounded-xl lg:flex-1 lg:min-h-0'> */}
      <NeighborDebtsPayments />
      {/* </div> */}
    </div>
  );
}
