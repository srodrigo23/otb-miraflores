import {
  Typography,
  Chip,
} from '@material-tailwind/react';

import {
  MeterReadingType,
} from '../../interfaces/measuresIterfaces';

import { color } from '../../types/commonTypes';

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

const MeasureReadingsTable: React.FC<{ readings: MeterReadingType[] }> = ({
  readings,
}) => {
  const getFullName = (reading: MeterReadingType) => {
    return `${reading.neighbor_last_name || ''} ${reading.neighbor_first_name || ''} ${reading.neighbor_second_name || ''}`.trim();
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('es-BO', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //   });
  // };

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
      <div className='h-[600px] overflow-y-auto'>
        <div className='flex flex-col h-full'>
          <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg'>
            {readings?.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <Typography variant='small' color='gray'>
                  No hay lecturas registradas para esta medición
                </Typography>
              </div>
            ) : (
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
                  {readings.map((reading, index) => {
                    const isLast = index === readings.length - 1;
                    const classes = isLast
                      ? 'p-3'
                      : 'p-3 border-b border-blue-gray-50';
                    return (
                      <tr key={reading.id} className='hover:bg-blue-gray-50/50'>
                        <td className={classes}>
                          <Typography
                            variant='small'
                            color='blue-gray'
                            className='font-normal'
                          >
                            {index + 1}
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
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeasureReadingsTable;
