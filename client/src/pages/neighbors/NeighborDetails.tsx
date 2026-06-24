import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNeighborDetailsData } from '../../hooks/useNeighborsData';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';

import {
  Button, Card, CardBody, Typography, Chip,
  Accordion, AccordionHeader, AccordionBody,
  CardHeader
} from '@material-tailwind/react';
import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
        {label}
      </Typography>
      <Typography variant="paragraph" color="blue-gray">
        {value || '-'}
      </Typography>
    </div>
  );
}

export default function NeighborDetails() {
  const [openInfo, setOpenInfo] = useState(true);
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error} = useNeighborDetailsData(id);

  if(isLoading) return <LoaderAnimation isLoading />;
  if(error) return<>{error}</>
  
  return (
    <div className='mx-auto container w-full flex flex-col gap-6 h-full py-7 px-3 lg:px-3'>
      <div>
        <Button onClick={() => navigate('/vecinos')}> Volver</Button>
      </div>

      <Card className='w-full shadow-sm p-0'>
        <CardBody className='p-0'>
          <div
          // className='flex items-center gap-4 mb-6 pb-4 border-b border-blue-gray-50'
          >
            <Accordion open={openInfo} className='p-0'>
              <AccordionHeader onClick={() => setOpenInfo(!openInfo)} className='p-0'>
                <div>
                  <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md'>
                    {data?.first_name?.[0]}
                    {data?.last_name?.[0]}
                  </div>
                  <Typography
                    variant='h5'
                    color='blue-gray'
                    className='font-semibold'
                  >
                    {data?.first_name} {data?.second_name} {data?.last_name}
                  </Typography>
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
            </Accordion>
          </div>

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

      <div className='border rounded-xl lg:flex-1 lg:min-h-0'>
        <NeighborDebtsPayments />
      </div>
    </div>
  );
}
