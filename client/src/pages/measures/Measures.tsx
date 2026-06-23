import { CSSProperties, useState, useEffect } from 'react';
import MeasureReadingsTable from '../../components/tables/MeasureReadingsTable';
import { ClipLoader } from 'react-spinners';
import NewMeasureModalForm from '../../components/forms/NewMeasureModalForm';

import {
  Typography,
  Button,
  Select, Option
} from '@material-tailwind/react';

import { MeasureType } from '../../interfaces/measuresIterfaces';

import { useMeasuresData } from '../../hooks/useMeasuresData';

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'yellow',
};

type FormNewMeasureType = {
  measureDate: string,
  period: string,
  readerName: string,
  notes: string,
};

const Measures = () => {
  
  const {data:measuresData = [], isLoading:loadingMeasuresData} = useMeasuresData()  
  const [selectedMeasure, setSelectedMeasure] = useState<MeasureType | null>(
    null,
  );

  /** 
   * Code for new measure 
  */
  const [openNewMeasureModal, setOpenNewMeasureModal] = useState(false);
  const handleOpenModal = () => setOpenNewMeasureModal(!openNewMeasureModal);

  // const fetchReadings = async () => {
  //   if (!measure) return;
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${apiLink}/${measure.id}/meter-readings`);
  //     const data = await response.json();
  //     // setReadings(data);
  //   } catch (error) {
  //     console.error('Error al cargar lecturas:', error);
  //     toast.error('Error al cargar las lecturas de medidores');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchMeasures = () => {
  //   setLoading(true);
  //   fetch(apiLink, {
  //     method: 'GET',
  //   })
  //     .then((response) => response.json())
  //     .then((json) => {
  //       setData(json);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       setLoading(false);
  //       toast.error('Error al cargar las mediciones');
  //     });
  // };

  useEffect(() => {
    if(measuresData.length>0){
      setSelectedMeasure(measuresData[0])
    }
  }, [measuresData]);

  // Handler para crear nueva medición
  const apiLink = ""
  const handleCreateMeasure = (formData: FormNewMeasureType) => {
    fetch(apiLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        measure_date: formData.measureDate,
        period: formData.period,
        reader_name: formData.readerName,
        notes: formData.notes,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        // fetchMeasures();
        // toast.success('Medición creada exitosamente');
      })
      .catch((error) => {
        console.error('Error al crear medición:', error);
        // toast.error('Error al crear la medición');
      });
  };

  // Handler para eliminar
  // const handleDeleteMeasure = (measure: MeasureType) => {
  //   if (window.confirm(`¿Está seguro de eliminar la medición del ${measure.measure_date}?`)) {
  //     fetch(`${apiLink}/${measure.id}`, {
  //       method: 'DELETE',
  //     })
  //       .then(() => {
  //         fetchMeasures();
  //         toast.success('Medición eliminada exitosamente');
  //       })
  //       .catch((error) => {
  //         console.error('Error al eliminar medición:', error);
  //         toast.error('Error al eliminar la medición');
  //       });
  //   }
  // };

  // Handler para ver lecturas
  // const handleViewReadings = (measure: MeasureType) => {
  //   setSelectedMeasure(measure);
  //   setOpenReadingsModal(true);
  // };

  // // Handler para cerrar modal de lecturas
  // const handleCloseReadingsModal = () => {
  //   setOpenReadingsModal(false);
  //   setSelectedMeasure(null);
  // };

  // // Handler para generar deudas
  // const handleGenerateDebts = async (measure: MeasureType) => {
  //   if (!window.confirm(`¿Está seguro de generar deudas para la medición del ${measure.measure_date}?`)) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://127.0.0.1:8000/measures/${measure.id}/generate-debts`, {
  //       method: 'POST',
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       toast.success(
  //         `Deudas generadas exitosamente: ${data.debts_created} creadas, ${data.debts_skipped} omitidas`
  //       );
  //     } else {
  //       toast.error(data.detail || 'Error al generar deudas');
  //     }
  //   } catch (error) {
  //     console.error('Error al generar deudas:', error);
  //     toast.error('Error al generar deudas');
  //   }
  // };

  // // Handler para eliminar deudas
  // const handleDeleteDebts = async (measure: MeasureType) => {
  //   if (!window.confirm(`¿Está seguro de eliminar las deudas pendientes de la medición del ${measure.measure_date}?\nSolo se eliminarán las deudas que no hayan sido pagadas.`)) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://127.0.0.1:8000/measures/${measure.id}/debts`, {
  //       method: 'DELETE',
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       toast.success(
  //         `Deudas eliminadas exitosamente: ${data.debts_deleted} deudas pendientes eliminadas`
  //       );
  //     } else {
  //       toast.error(data.detail || 'Error al eliminar deudas');
  //     }
  //   } catch (error) {
  //     console.error('Error al eliminar deudas:', error);
  //     toast.error('Error al eliminar deudas');
  //   }
  // };

  const getMeasureByPeriod = (period:string='')=>{
    return measuresData.filter((measure) => measure.period === period)[0];
  }

  return (
    <>
      {loadingMeasuresData ? (
        <div className='flex justify-center items-center py-20'>
          <ClipLoader
            loading={loadingMeasuresData}
            cssOverride={override}
            size={150}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        </div>
      ) : (
        <div className=''>
          <div className='flex justify-between py-3 flex-shrink-0'>
            <Typography className='text-center mb-2' variant='h3' color='black'>
              Mediciones
            </Typography>

            <div className='flex gap-2 items-center'>
              {measuresData.length > 0 ? (
                <Select
                  label='Seleccionar medición'
                  value={selectedMeasure?.period}
                  onChange={(val) => {
                    const measureToChange = getMeasureByPeriod(val);
                    if (measureToChange) {
                      setSelectedMeasure(measureToChange);
                    }
                  }}
                >
                  {measuresData?.map((el, index) => (
                    <Option key={index} value={el.period}>
                      {el.period}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Typography
                  className='text-center h-fit mr-5 text-xl font-bold'
                  // variant='h5'
                  color='red'
                >
                  No hay mediciones
                </Typography>
              )}
              <Button className='w-60' onClick={handleOpenModal}>
                NUEVA MEDICIÓN
              </Button>
            </div>
          </div>
        </div>
      )}
      {!selectedMeasure ? (
        <div className='flex justify-center items-center py-20'>
          <ClipLoader
            loading={loadingMeasuresData}
            cssOverride={override}
            size={150}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        </div>
      ) : (
        <MeasureReadingsTable measure={selectedMeasure} />
      )}

      <NewMeasureModalForm
        openModalState={openNewMeasureModal}
        handleCloseModal={handleOpenModal}
        onSubmit={(data) => {
          handleCreateMeasure(data);
        }}
      />
    </>
  );
};

export default Measures;