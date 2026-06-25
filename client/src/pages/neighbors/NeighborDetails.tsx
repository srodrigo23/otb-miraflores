import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNeighborDetailsData } from '../../hooks/useNeighborsData';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';

import {
  Button, Card, CardBody, Typography, Chip,
  Accordion, AccordionHeader, AccordionBody,
} from '@material-tailwind/react';
import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';
import { ArrowLongLeftIcon } from '@heroicons/react/24/outline';

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className='font-semibold  text-gray-500'>{label}</div>
      <div className='text-2xl '>{value || '-'}</div>
    </div>
  );
}

export default function NeighborDetails() {
  const [openInfo, setOpenInfo] = useState(false);
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error} = useNeighborDetailsData(id);

  if(isLoading) return <LoaderAnimation isLoading />;
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
                onClick={() => setOpenInfo(!openInfo)}
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
                      <Chip
                        size='sm'
                        value={data?.section || 'Sin sección'}
                        color='blue'
                        variant='ghost'
                      />
                      <Typography variant='small' color='gray'>
                        CI: {data?.ci}
                      </Typography>
                    </div>
                  </div>
                </div>
              </AccordionHeader>
              <AccordionBody>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 px-6'>
                  <InfoField label='Primer Nombre' value={data?.first_name} />
                  <InfoField label='Segundo Nombre' value={data?.second_name} />
                  <InfoField label='Apellido' value={data?.last_name} />
                  <InfoField label='Cédula de Identidad' value={data?.ci} />
                  <InfoField label='Teléfono' value={data?.phone_number} />
                  <InfoField label='Email' value={data?.email} />
                  <InfoField
                    label='Fecha de Nacimiento'
                    value={
                      data?.birth_day
                        ? new Date(data.birth_day).toLocaleDateString('es-ES')
                        : '-'
                    }
                  />
                  <InfoField label='Sección' value={data?.section} />
                </div>
              </AccordionBody>
            </Accordion>

            {/* <Accordion open={openInfo}>
            <AccordionHeader onClick={() => setOpenInfo(!openInfo)}>
              Información Personal
            </AccordionHeader>
            <AccordionBody>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4'>
                <InfoField label='Primer Nombre' value={data?.first_name} />
                <InfoField label='Segundo Nombre' value={data?.second_name} />
                <InfoField label='Apellido' value={data?.last_name} />
                <InfoField label='Cédula de Identidad' value={data?.ci} />
                <InfoField label='Teléfono' value={data?.phone_number} />
                <InfoField label='Email' value={data?.email} />
                <InfoField
                  label='Fecha de Nacimiento'
                  value={
                    data?.birth_day
                      ? new Date(data.birth_day).toLocaleDateString('es-ES')
                      : '-'
                  }
                />
                <InfoField label='Sección' value={data?.section} />
              </div>
            </AccordionBody>
          </Accordion> */}
          </CardBody>
        </Card>
      </div>

      {/* <div className='border rounded-xl lg:flex-1 lg:min-h-0'> */}
        <NeighborDebtsPayments />
      {/* </div> */}
    </div>
  );
}
