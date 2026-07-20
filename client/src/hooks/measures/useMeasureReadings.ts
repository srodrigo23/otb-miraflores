import { useEffect } from "react";
import useFetchData from "../useFetchData";
import { MeterReadingType } from "../../interfaces/measuresIterfaces";

import { apiLink } from "../../config";

export const useMeasureReadings = (idMeasure:number)=>{

  const apiMeasureReadings = `${apiLink}/measures/${idMeasure}/meter-readings`
  const apiMeterReadingsByMeasure = `${apiLink}/measures/${idMeasure}/generate-empty-meter-readings`

  const { data, isLoading, error, execute } = useFetchData<MeterReadingType[]>();

  useEffect(()=>{
    execute(apiMeasureReadings, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  }, [idMeasure])
// ''
  const createEmptyMeterReadingsByMeasure = async ()=>{
    await execute(apiMeterReadingsByMeasure, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return { data, isLoading, error, createEmptyMeterReadingsByMeasure }
}