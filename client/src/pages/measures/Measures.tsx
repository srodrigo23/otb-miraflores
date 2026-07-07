import { useState } from 'react';

import NewMeasureModalForm from '../../components/forms/NewMeasureModalForm';

import {
  Button,
  Card,
  CardBody,
  Typography,
} from '@material-tailwind/react';

import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

import { useMeasuresData } from '../../hooks/measures/useMeasuresData';
import useNewMeasure from '../../hooks/measures/useNewMeasure';
import MeasureTable from '../../components/tables/MeasureTable';
import { LoaderAnimation } from '../../components/shared/LoaderAnimation';
import { MeasureType } from '../../interfaces/measuresIterfaces';
import { InputsNewMeasureForm } from '../../types/MeasuresTypes';
import useDeleteMeasure from '../../hooks/measures/useDeleteMeasure';


const Measures = () => {
  const {
    data: measuresData = [],
    isLoading: loadingMeasuresData,
    refetchMeasures,
  } = useMeasuresData();

  const [openNewMeasureModal, setOpenNewMeasureModal] = useState(false);
  const handleOpenModal = () => setOpenNewMeasureModal(!openNewMeasureModal);

  const {
    createNewMeasure,
    isLoading: loadingMeasureCreated,
  } = useNewMeasure();

  // const {deleteMeasure} = useDeleteMeasure();
  
  // const handlerDelete = async (measure:MeasureType) =>{
  //   await deleteMeasure(measure)
  //   refetchMeasures()
  // }

  const handlerNewMeasure = async (data: InputsNewMeasureForm) => {
    await createNewMeasure(data);
    refetchMeasures();
  };

  return (
    <>
      <div className='mx-auto container w-full flex flex-col gap-6 h-full py-4 px-3 lg:px-3'>
        <div className='flex flex-col sm:flex-row justify-between gap-3 py-3 items-center border rounded-lg p-5'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            <Card className='shadow-sm'>
              <CardBody className='p-3 lg:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-blue-gray-50'>
                    <ClipboardDocumentListIcon className='w-5 h-5 lg:w-6 lg:h-6 text-blue-gray-700' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium leading-tight'
                    >
                      Total
                    </Typography>
                    <Typography variant='h4' color='blue-gray'>
                      {measuresData.length}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className='shadow-sm'>
              <CardBody className='p-3 lg:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-green-50'>
                    <CheckCircleIcon className='w-5 h-5 lg:w-6 lg:h-6 text-green-700' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium leading-tight'
                    >
                      Creadas
                    </Typography>
                    <Typography variant='h4' color='green'>
                      {
                        measuresData.filter((el) => el.status === 'CREATED')
                          .length
                      }
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className='shadow-sm'>
              <CardBody className='p-3 lg:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-blue-50'>
                    <ArrowPathIcon className='w-5 h-5 lg:w-6 lg:h-6 text-blue-700' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium leading-tight'
                    >
                      En Progreso
                    </Typography>
                    <Typography variant='h4' color='blue'>
                      {
                        measuresData.filter((el) => el.status === 'IN_PROGRESS')
                          .length
                      }
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className='shadow-sm'>
              <CardBody className='p-3 lg:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-red-50'>
                    <LockClosedIcon className='w-5 h-5 lg:w-6 lg:h-6 text-red-700' />
                  </div>
                  <div>
                    <Typography
                      variant='small'
                      color='blue-gray'
                      className='font-medium leading-tight'
                    >
                      Cerradas
                    </Typography>
                    <Typography variant='h4' color='red'>
                      {
                        measuresData.filter((el) => el.status === 'CLOSED')
                          .length
                      }
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <Button
            className='w-60 h-fit'
            onClick={handleOpenModal}
            disabled={loadingMeasuresData && loadingMeasureCreated}
          >
            NUEVA MEDICIÓN
          </Button>
        </div>
        {loadingMeasuresData ? (
          <LoaderAnimation />
        ) : (
          <MeasureTable tableData={measuresData}/>
        )}
      </div>

      <NewMeasureModalForm
        openModalState={openNewMeasureModal}
        handleCloseModal={handleOpenModal}
        onSubmit={handlerNewMeasure}
      />

    </>
  );
};

export default Measures;
