import { fetchPostJson } from "@/api";
import { useCallback, useState } from "react";

type TStatus = "success" | "error" | "loading" | undefined;

export const usePromocode = () => {
  const [promocodeStatus, setPromocodeStatus] = useState<TStatus>();
  const [promocodeValue, setPromocodeValue] = useState<number | undefined>();

  const checkPromo = useCallback(
    async (promocode: string, type: "month" | "year") => {
      setPromocodeStatus("loading");
      try {
        const res = await fetchPostJson({
          path: "/promocode/check",
          data: {
            promocode,
            type,
          },
        });
        const json = await res.json();
        if (json.success) {
          setPromocodeStatus("success");
          setPromocodeValue(json?.value || 0);
          return;
        }

        setPromocodeStatus("error");
        setPromocodeValue(0);
      } catch (_e) {
        setPromocodeStatus("error");
      }
    },
    []
  );

  return { checkPromo, promocodeStatus, promocodeValue };
};
