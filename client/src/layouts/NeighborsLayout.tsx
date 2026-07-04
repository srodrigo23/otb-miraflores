import { Outlet } from "react-router-dom"
import { Typography } from "@material-tailwind/react";

export default function NeighborsLayout(){

  return (
    <div className='mx-auto container w-full flex flex-col gap-6 h-full py-7 px-3 lg:px-3'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0'>
        <Typography variant='h2'>Lista General de Vecinos</Typography>
      </div>
      <Outlet />
    </div>
  );
}