import { useState } from "react";
import { Typography, IconButton, Input } from "@material-tailwind/react";
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';


export const EditNeighborInfoForm = ()=>{

  const [edit, setEdit] = useState<boolean>(false);

  return (
    <div className='border rounded-md p-4 w-4/5 xl:w-3/4 h-fit'>
      <div className='flex justify-between pb-3'>
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
            <IconButton size='sm' variant='filled' color='green'>
              <CheckIcon className='h-5 w-5' />
            </IconButton>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-2 items-center '>
        <div className='flex col-span-1 justify-start lg:justify-end'>
          <Typography variant='h6' color='black'>
            Nombres:
          </Typography>
        </div>
        <div className='col-span-4'>
          <Input
            value={'JUAN'}
            disabled={!edit}
            // crossOrigin={undefined}
          />
        </div>
        <div className='flex col-span-1 justify-start lg:justify-end'>
          <Typography variant='h6' color='black'>
            Apellidos:
          </Typography>
        </div>
        <div className='col-span-4'>
          <Input
            defaultValue={'ACNO'}
            disabled={!edit}
            crossOrigin={undefined}
            // {...register('lastName', { required: true })}
          />
        </div>
        <div className='flex col-span-1 justify-start lg:justify-end'>
          <Typography variant='h6' color='black'>
            Ci:
          </Typography>
        </div>
        <div className='flex col-span-4 justify-end'>
          <Input
            defaultValue={''}
            disabled={!edit}
            crossOrigin={undefined}
            // {...register('ci', { required: true })}
          />
        </div>
        <div className='flex col-span-1 justify-start lg:justify-end'>
          <Typography variant='h6' color='black'>
            Celular:
          </Typography>
        </div>
        <div className='flex col-span-4 justify-end'>
          <Input
            type='number'
            inputMode='numeric'
            disabled={!edit}
            className='appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            crossOrigin={undefined}
            // {...register('phonenumber', { required: true })}
          />
        </div>
        <div className='flex col-span-1 justify-start lg:justify-end'>
          <Typography variant='h6' color='black'>
            Correo:
          </Typography>
        </div>
        <div className='flex col-span-4 justify-end'>
          <Input
            disabled={!edit}
            defaultValue={''}
            crossOrigin={undefined}
            // {...register('email')}
          />
        </div>
      </div>
    </div>
  );
}

