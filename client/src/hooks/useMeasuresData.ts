import { useEffect } from "react"
import useFetchData from "./useFetchData"
import { MeasureType } from "../interfaces/measuresIterfaces"
import { apiLink } from '../config';

export const useMeasuresData = () => {

  const apiMeasures = `${apiLink}/measures`
  const { data, isLoading, error, execute } = useFetchData<MeasureType[]>();
  useEffect(() => {
    execute(apiMeasures, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  return { data, isLoading, error }
}