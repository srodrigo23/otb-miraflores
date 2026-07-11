import { Button } from "@material-tailwind/react";
import { PlayIcon, PrinterIcon, StopIcon } from "@heroicons/react/24/outline";
import { DetailCardsReadings } from "./DetailCardsReadings"
import { useState } from "react";


export const MeasureReadings:React.FC<{measureId:number}> = ({measureId}) =>{

  const [initFillOutReadings, setInitFillOutReadings] = useState<boolean>(false);

  return (
    <>
      <div className='flex flex-col sm:flex-row justify-between gap-3 py-3 items-center border rounded-lg p-5'>
        <DetailCardsReadings meterReadings={[]} />
        <div className='flex flex-row sm:flex-col gap-2 w-full sm:w-auto'>
          <Button
            variant='gradient'
            color={initFillOutReadings ? 'blue' : 'red'}
            className='flex items-center justify-center gap-2 h-fit'
            onClick={() => {
              setInitFillOutReadings(!initFillOutReadings);
            }}
          >
            {initFillOutReadings ? (
              <PlayIcon className='w-4 h-4' />
            ) : (
              <StopIcon className='w-4 h-4' />
            )}
            {initFillOutReadings ? 'Iniciar Llenado' : 'Cerrar Llenado'}
          </Button>
          <Button
            variant='outlined'
            color='blue-gray'
            className='flex items-center justify-center gap-2 h-fit'
          >
            <PrinterIcon className='w-4 h-4' />
            Imprimir Tabla
          </Button>
        </div>
      </div>
    </>
  );

}
