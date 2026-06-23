import { useState } from 'react';
import { apiLink } from '../config';
import { NeighborType } from '../interfaces/neighborsInterfaces';

type UpdateNeighborPayload = Omit<NeighborType, 'id'>;

export const useUpdateNeighbor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const update = async (id: number, payload: UpdateNeighborPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiLink}/neighbors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      return { ok: response.ok, data: json };
    } catch (err) {
      setError(err);
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, update };
};
