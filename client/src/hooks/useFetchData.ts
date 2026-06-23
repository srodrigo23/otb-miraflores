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
      setData(json.data);
      return { ok: response.ok, data: json };
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, execute };
};

export default useFetchData;