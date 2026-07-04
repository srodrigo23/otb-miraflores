import { useState } from "react";

const useFetchData = <T> () => {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const execute = async (url: string, options?: RequestInit) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url, options);
      const json = await response.json();
      if (!response.ok) {
        setError(json);
        return { ok: false, data: json };
      }
      setData(json);
      return { ok: true, data: json };
    } catch (err) {
      setError(err);
      return { ok: false, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, execute };
};

export default useFetchData;