import { toast } from 'react-toastify';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';
import { NeighborType } from '../../interfaces/neighborsInterfaces';
import { InputsNewNeighborForm } from '../../types/NeighborsTypes';

/** Detail the API sends back on a rejected create, e.g. a duplicated CI */
type ApiError = { detail?: string };

export const useNewNeighbor = () => {
  const { data, isLoading, error, execute } = useFetchData<NeighborType>();
  const apiLinkNewNeighbor = `${apiLink}/neighbors`;

  /** Resolves to whether the neighbor was created, so the form can stay open on failure */
  const createNewNeighbor = async (payload: InputsNewNeighborForm) => {
    const result = await execute(apiLinkNewNeighbor, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result?.ok) {
      const created = result.data as NeighborType;
      toast.success(
        `Vecino ${created.pat_lname} ${created.names} creado exitosamente`,
      );
      return true;
    }

    // The router answers a duplicated CI or email with a readable detail;
    // anything else falls back to a generic message.
    const detail = (result?.data as ApiError | null)?.detail;
    toast.error(
      typeof detail === 'string' ? detail : 'No se pudo crear el vecino',
    );
    return false;
  };

  return { createNewNeighbor, isLoading, data, error };
};

export default useNewNeighbor;
