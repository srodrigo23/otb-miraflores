import { useEffect } from "react"
import useFetchData from "./useFetchData"
import { apiLink } from "../config"
import { NeighborType } from "../interfaces/neighborsInterfaces"

export const useNeighborsData = () => {
  
  const { data, isLoading, error, execute } = useFetchData<NeighborType[]>();
  const apiLinkNeightbors = `${apiLink}/neighbors`

  useEffect(() => {
    execute(apiLinkNeightbors,{
      method: 'GET',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  const refetch = () => execute(apiLinkNeightbors,{
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return { data, isLoading, error, refetch }
}