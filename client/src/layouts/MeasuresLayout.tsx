import { Outlet } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";

export default function MeasuresLayout() {
  return (
    <div className='mx-auto container w-full flex flex-col h-full py-7 px-3 lg:px-3'>
      <Typography className='text-center mb-2' variant='h3' color='black'>
        Lista general de Mediciones
      </Typography>
      {/* <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 flex-shrink-0'> */}
      {/* <Typography variant='h2'>Lista General de Vecinos</Typography> */}
      {/* </div> */}
      <Outlet />
    </div>
  );
}
