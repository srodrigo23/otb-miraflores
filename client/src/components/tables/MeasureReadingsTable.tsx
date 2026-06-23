
import {
  Typography,
  // Button, 
  Chip
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';

// import { PrinterIcon } from '@phosphor-icons/react';

type color =
  | 'blue-gray'
  | 'gray'
  | 'brown'
  | 'deep-orange'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'light-green'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'light-blue'
  | 'blue'
  | 'indigo'
  | 'deep-purple'
  | 'purple'
  | 'pink'
  | 'red';

import {
  MeasureType,
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';
import { useMeasureReadings } from '../../hooks/useMeasureReadings';

const STATUS_COLORS: { [key: string]: color } = {
  normal: 'green',
  estimated: 'amber',
  not_read: 'red',
  meter_error: 'red',
};

const STATUS_LABELS: { [key: string]: string } = {
  normal: 'Normal',
  estimated: 'Estimado',
  not_read: 'No Leído',
  meter_error: 'Error Medidor',
};

const MeasureReadingsTable: React.FC<{measure:MeasureType|null}> = ({ measure }) => {
  
  const { data:readings = [], isLoading:loading } = useMeasureReadings(measure?.id || 0);

  const getFullName = (reading: MeterReadingType) => {
    return `${reading.neighbor_last_name || ''} ${reading.neighbor_first_name || ''} ${reading.neighbor_second_name || ''}`.trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // const formatDateTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleString('es-BO', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });
  // };

  return (
    <>
      <>
        <div className='flex flex-col gap-1 border rounded-lg my-5 p-5'>
          <div className=''>
            <Typography className='text-center' variant='h5'>
              MARZO - ABRIL (2026)
            </Typography>
          </div>
          {/* <Typography variant='small' color='gray' className='font-normal'>
            Estado: {measure?.status}
          </Typography> */}

          <div className='grid'>
            {measure && (
              <div className='flex justify-between'>
                <div className='flex flex-col items-center'>
                  <Typography
                    variant='small'
                    color='gray'
                    className='font-bold'
                  >
                    Periodo
                  </Typography>
                  <Typography variant='small' color='gray' className='text-2xl'>
                    {measure.period}
                  </Typography>
                </div>
                <div className='flex flex-col items-center'>
                  <Typography
                    variant='small'
                    color='gray'
                    className='font-bold'
                  >
                    Total de lecturas
                  </Typography>
                  <Typography variant='small' color='gray' className='text-2xl'>
                    {readings.length}
                  </Typography>
                </div>

                <div className='flex flex-col items-center'>
                  <Typography
                    variant='small'
                    color='gray'
                    className='font-bold'
                  >
                    Núm. de observaciones:
                  </Typography>
                  <Typography variant='small' color='gray' className='text-2xl'>
                    {readings.filter((reading) => reading.notes !== '').length}
                  </Typography>
                </div>
                <div className='flex flex-col items-center'>
                  <Typography
                    variant='small'
                    color='gray'
                    className='font-bold'
                  >
                    Fecha de Medición
                  </Typography>
                  <Typography variant='small' color='gray' className='text-2xl'>
                    {formatDate(measure.measure_date)}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </div>
      </>

      <div className='h-[600px] overflow-y-auto'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <ClipLoader size={50} />
          </div>
        ) : (
          <>
            <div className='overflow-auto border border-blue-gray-100 rounded-lg'>
              <table className='w-full min-w-max table-auto text-left'>
                <thead className='sticky top-0 bg-blue-gray-50 z-10'>
                  <tr>
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Núm.
                      </Typography>
                    </th>
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Apellidos y Nombre
                      </Typography>
                    </th>
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Medidor
                      </Typography>
                    </th>
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Lectura
                      </Typography>
                    </th>
                    {/* <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-3">
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Estado
                      </Typography>
                    </th> */}
                    {/* <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-3">
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Anomalía
                      </Typography>
                    </th> */}
                    {/* <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-3">
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Fecha Lectura
                      </Typography>
                    </th> */}
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Observaciones
                      </Typography>
                    </th>
                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'>
                      <Typography
                        variant='small'
                        color='blue-gray'
                        className='font-bold'
                      >
                        Acciones
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {readings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='p-4 text-center'>
                        <Typography variant='small' color='gray'>
                          No hay lecturas registradas para esta medición
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    readings.map((reading, index) => {
                      const isLast = index === readings.length - 1;
                      const classes = isLast
                        ? 'p-3'
                        : 'p-3 border-b border-blue-gray-50';
                      return (
                        <tr
                          key={reading.id}
                          className='hover:bg-blue-gray-50/50'
                        >
                          <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-normal'
                            >
                              {index+1}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-normal'
                            >
                              {getFullName(reading)}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-normal'
                            >
                              {reading.meter_number || '-'}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-semibold'
                            >
                              {reading.current_reading}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Chip
                              size='sm'
                              value={STATUS_LABELS['estimated']}
                              color={STATUS_COLORS['estimated']}
                            />
                          </td>
                          {/* <td className={classes}>
                            {reading.has_anomaly ? (
                              <Chip size='sm' value='Sí' color='red' />
                            ) : (
                              <Typography variant='small' color='blue-gray'>
                                No
                              </Typography>
                            )}
                          </td> */}
                          {/* <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-normal'
                            >
                              {formatDateTime(reading.reading_date)}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant='small'
                              color='blue-gray'
                              className='font-normal'
                            >
                              {reading.notes || '-'}
                            </Typography>
                          </td> */}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MeasureReadingsTable;