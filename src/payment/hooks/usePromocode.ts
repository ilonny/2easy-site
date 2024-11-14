import { useCallback, useState } from "react";

type TStatus = "success" | "error" | "loading" | undefined;

export const usePromocode = () => {
  const [promocodeStatus, setPromocodeStatus] = useState<TStatus>();
  const [promocodeValue, setPromocodeValue] = useState<number | undefined>();

  const checkPromo = useCallback((promocode: string) => {
    setPromocodeStatus("loading");
    setTimeout(() => {
      setPromocodeStatus("success");
      setPromocodeValue(100);
    }, 2000);
  }, []);

  return { checkPromo, promocodeStatus, promocodeValue };
};
