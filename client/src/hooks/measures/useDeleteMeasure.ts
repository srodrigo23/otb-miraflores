

import { MeasureType } from "../../interfaces/measuresIterfaces";
import useFetchData from "../useFetchData";
import { apiLink } from "../../config";
import { toast } from 'react-toastify';

const useDeleteMeasure = () => {
  
  const {data, isLoading, error, execute} = useFetchData<MeasureType>();
  
  const deleteMeasure = async (measure: MeasureType) => {
    const apiLinkDeleteMeasure = `${apiLink}/measures/${measure.id}`

    await execute(apiLinkDeleteMeasure, {
      method:'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }).then(
      (data)=>{
        if(data?.ok) {
          toast.success(`Se ha elminado exitosamente la medición : ${measure.period} (${measure.measure_date.split('-')[0]})`)
          return true;
        }
      }
    )
  }
  return {deleteMeasure, isLoading, data, error}
}
export default useDeleteMeasure;