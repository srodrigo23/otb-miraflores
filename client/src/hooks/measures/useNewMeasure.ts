import { MeasureType } from "../../interfaces/measuresIterfaces";
import useFetchData from "../useFetchData";
import { apiLink } from "../../config";
import { toast } from 'react-toastify';
import { InputsNewMeasureForm } from "../../types/MeasuresTypes";

const useNewMeasure =()=> {
  
  const {data, isLoading, error, execute} = useFetchData<MeasureType>();
  const apiLinkNewMeasure = `${apiLink}/measures`

  const createNewMeasure = async (payload:InputsNewMeasureForm) => {
    execute(apiLinkNewMeasure, {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(
      (data)=>{
        if(data?.ok) toast.success('Exitoso')
      }
    )
  }
  return {createNewMeasure, isLoading, data, error}
}
export default useNewMeasure;