// import { useState } from 'react';
import { apiLink } from '../config';
import { NeighborType } from '../interfaces/neighborsInterfaces';

import useFetchData from './useFetchData';
import { UpdateNeighborPayloadType } from '../interfaces/neighborsInterfaces';


export const useUpdateNeighbor = (neighborId:number|undefined) => {

  const { data, isLoading, error, execute } = useFetchData<NeighborType>();
  const apiLinkEditDataNeightbor = `${apiLink}/neighbors/${neighborId}`
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<unknown>(null);
  // payload:UpdateNeighborPayload
  const update = async(payload:UpdateNeighborPayloadType)=> {
    return execute(apiLinkEditDataNeightbor, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  };

  // const update = async (id: number, payload: UpdateNeighborPayload) => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch(`${apiLink}/neighbors/${id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });
  //     const json = await response.json();
  //     return { ok: response.ok, data: json };
  //   } catch (err) {
  //     setError(err);
  //     return { ok: false };
  //   } finally {
  //     setIsLoading(false);
  //   }
  

  return {data, isLoading, error, update };
};
