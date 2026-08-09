import { useEffect } from "react";
import { toast } from 'react-toastify';
import useFetchData from "../useFetchData";
import {
  MeterReadingType,
  ReadingUpdateType,
} from "../../interfaces/measuresIterfaces";

import { apiLink } from "../../config";

export const useMeasureReadings = (idMeasure:number)=>{

  const apiMeasureReadings = `${apiLink}/measures/${idMeasure}/meter-readings`
  const apiMeterReadingsByMeasure = `${apiLink}/measures/${idMeasure}/generate-empty-meter-readings`

  const { data, setData, isLoading, error, execute } = useFetchData<MeterReadingType[]>();

  // Separate instance: the update answers with a single reading, so sharing the
  // one above would overwrite the list with an object
  const { isLoading: isSavingReading, execute: executeUpdate } =
    useFetchData<MeterReadingType>();

  /**
   * Reads the list and hands it back to the caller, so anything that needs the
   * readings on demand (the printable sheet, for one) gets fresh data without
   * waiting for a re-render.
   */
  const fetchMeterReadings = async (): Promise<MeterReadingType[]> => {
    const response = await execute(apiMeasureReadings, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return response?.ok ? (response.data as MeterReadingType[]) : []
  }

  useEffect(()=>{
    fetchMeterReadings()
  }, [idMeasure])
// ''
  const createEmptyMeterReadingsByMeasure = async ()=>{
    await execute(apiMeterReadingsByMeasure, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const updateMeterReading = async (
    readingId: number,
    values: ReadingUpdateType,
  ) => {
    const response = await executeUpdate(
      `${apiMeasureReadings}/${readingId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      },
    );

    if (!response?.ok) {
      toast.error('No se pudo guardar la lectura');
      return false;
    }

    // Patch only the edited row: refetching the whole list on every meter would
    // be a request per row while filling the table
    const updated = response.data as MeterReadingType;
    setData((current) =>
      (current ?? []).map((reading) =>
        reading.id === updated.id ? updated : reading,
      ),
    );
    toast.success(`Lectura del medidor ${updated.meter_number ?? ''} guardada`);
    return true;
  }

  return {
    data,
    isLoading,
    error,
    fetchMeterReadings,
    createEmptyMeterReadingsByMeasure,
    updateMeterReading,
    isSavingReading,
  }
}
