import { useEffect } from "react"
import useFetchData from "./useFetchData"
import { apiLink } from "../config"
import { NeighborType, NeighborWithDetailsType } from "../interfaces/neighborsInterfaces"
import { toast } from 'react-toastify';

export const useNeighborsData = () => {
  
  const { data, isLoading, error, execute } = useFetchData<NeighborType[]>();
  const apiLinkNeightbors = `${apiLink}/neighbors`

  useEffect(() => {
    // const abortController = new AbortController();
    execute(apiLinkNeightbors,{
      method: 'GET',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
      // signal: abortController.signal,
    }).then(
      (result) => {
        if (result?.ok) toast.success('Lista de vecinos cargada');
      }
    );
    // return () => abortController.abort();
  }, []);

  const refetch = () => execute(apiLinkNeightbors,{
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return { data, isLoading, error, refetch }
}

export const useNeighborDetailsData = (neighborId:number|undefined)=>{
  const { data, isLoading, error, execute } = useFetchData<NeighborWithDetailsType>();
  const apiLinkNeightbor = `${apiLink}/neighbors/${neighborId}`

  useEffect(() => {
    execute(apiLinkNeightbor,{
      method: 'GET',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  return { data, isLoading, error }

}