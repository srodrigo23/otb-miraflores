import { useParams, useNavigate } from 'react-router-dom';
import { useNeighborDetailsData } from '../../hooks/useNeighborsData';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';

import { Button, Typography } from '@material-tailwind/react';
import { EditNeighborInfoForm } from '../../components/forms/EditNeighborInfoForm';
import { NeighborDebtsPayments } from '../../components/NeighborDebtsPayments';

export default function NeighborDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error} = useNeighborDetailsData(id);

  if(isLoading) return <LoaderAnimation isLoading />;
  if(error) return<>{error}</>
  
  return (
    <div className='mx-auto container w-full flex flex-col gap-2 h-full py-7 px-3 lg:px-3'>
      <div>
        <Button onClick={() => navigate('/vecinos')}> Volver</Button>
      </div>
      <div>
        <Typography
          variant='h2'
          className='text-center'
        >{`${data?.first_name} ${data?.second_name} ${data?.last_name} `}</Typography>
      </div>

      <div className='flex flex-col gap-4 lg:flex-1 lg:overflow-y-auto lg:min-h-0'>
        <div className='flex justify-center flex-shrink-0'>
          <EditNeighborInfoForm />
        </div>

        <div className='border rounded-xl lg:flex-1 lg:min-h-0'>
          <NeighborDebtsPayments />
        </div>
      </div>

      {/* <h1>{data?.first_name}</h1>
      <p>{data?.second_name}</p>
      <p>{data?.last_name}</p>
      <p>{data?.ci}</p>
      <p>{data?.email}</p>
      <p>{data?.phone_number}</p> */}
    </div>
  );
}
