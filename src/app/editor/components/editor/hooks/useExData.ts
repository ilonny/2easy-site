import { useCallback, useState } from "react";

export const useExData = <T>(val: T) => {
  const [data, setData] = useState<T>(val);

  const changeData = useCallback((key: keyof T, value: typeof val[typeof key]) => {
    setData((_d) => {
      return {
        ..._d,
        [key]: value,
      };
    });
  }, []);

  return { data, changeData, setData };
};
