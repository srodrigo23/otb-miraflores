import { useEffect } from "react"
import useFetchData from "../useFetchData"
import { MeasureType } from "../../interfaces/measuresIterfaces"
import { apiLink } from '../../config';

export const useGetMeasure = (measureId:number) => {

  const apiMeasures = `${apiLink}/measures/${measureId}`

  const { data, isLoading, error, execute } = useFetchData<MeasureType>();
  useEffect(() => {
    execute(apiMeasures, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);
  return { data, isLoading, error}
}