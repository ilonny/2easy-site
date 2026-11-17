import { fetchPostJson } from "@/api";
import { useCallback, useState } from "react";

type TStatus = "success" | "error" | "loading" | undefined;
export type TPromocodeErrorReason =
  | "invalid"
  | "already_used"
  | "own_code"
  | "not_first_purchase"
  | "referral_cap";

const mapPromocodeReason = (reason: unknown): TPromocodeErrorReason => {
  if (
    reason === "already_used" ||
    reason === "own_code" ||
    reason === "not_first_purchase" ||
    reason === "referral_cap"
  ) {
    return reason;
  }
  return "invalid";
};

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
        setPromocodeErrorReason(mapPromocodeReason(json?.reason));
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

  const markPromocodeError = useCallback((reason: unknown) => {
    setPromocodeStatus("error");
    setPromocodeValue(0);
    setPromocodeErrorReason(mapPromocodeReason(reason));
  }, []);

  return {
    checkPromo,
    promocodeStatus,
    promocodeValue,
    promocodeErrorReason,
    markPromocodeAlreadyUsed,
    markPromocodeError,
  };
};
