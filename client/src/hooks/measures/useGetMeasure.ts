import { useEffect } from "react"
import useFetchData from "../useFetchData"
import { MeasureType } from "../../interfaces/measuresIterfaces"
import { apiLink } from '../../config';

export const useGetMeasure = (measureId:number) => {

  const apiMeasures = `${apiLink}/measures/${measureId}`
  const apiCloseMeasure = `${apiLink}/measures/${measureId}/close`

  const { data, isLoading, error, execute } = useFetchData<MeasureType>();

  // both endpoints answer with the measure, so every call refreshes `data`
  const refetchMeasure = async () => {
    await execute(apiMeasures, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const closeMeasure = async () => {
    await execute(apiCloseMeasure, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  useEffect(() => {
    execute(apiMeasures, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [measureId]);

  return { data, isLoading, error, refetchMeasure, closeMeasure }
}
