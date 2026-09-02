import { fetchPostJson } from "@/api";
import { useCallback, useState } from "react";

type TStatus = "success" | "error" | "loading" | undefined;
export type TPromocodeErrorReason = "invalid" | "already_used";

export const usePromocode = () => {
  const [promocodeStatus, setPromocodeStatus] = useState<TStatus>();
  const [promocodeValue, setPromocodeValue] = useState<number | undefined>();
  const [promocodeErrorReason, setPromocodeErrorReason] =
    useState<TPromocodeErrorReason>();

  const checkPromo = useCallback(
    async (promocode: string, type: "month" | "year" | "3month") => {
      setPromocodeStatus("loading");
      setPromocodeErrorReason(undefined);
      try {
        const res = await fetchPostJson({
          path: "/promocode/check",
          isSecure: true,
          data: {
            promocode: promocode.trim().toLowerCase(),
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
        setPromocodeErrorReason(
          json?.reason === "already_used" ? "already_used" : "invalid",
        );
      } catch (_e) {
        setPromocodeStatus("error");
        setPromocodeErrorReason("invalid");
      }
    },
    [],
  );

  const markPromocodeAlreadyUsed = useCallback(() => {
    setPromocodeStatus("error");
    setPromocodeValue(0);
    setPromocodeErrorReason("already_used");
  }, []);

  return {
    checkPromo,
    promocodeStatus,
    promocodeValue,
    promocodeErrorReason,
    markPromocodeAlreadyUsed,
  };
};
