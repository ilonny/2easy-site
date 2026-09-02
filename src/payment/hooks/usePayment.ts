import { fetchGet, fetchPostJson } from "@/api";
import { SibscribeContext } from "@/subscribe/context";
import { useCallback, useContext, useEffect, useState } from "react";

export const usePayment = () => {
  const { getSubscribe } = useContext(SibscribeContext);
  const [paymentIsLoading, setPaymentIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "error" | undefined
  >();
  const [paymentErrorReason, setPaymentErrorReason] = useState<
    string | undefined
  >();

  const createPayment = useCallback(
    async (
      type: "month" | "year",
      phone: string,
      promocode: string,
      email?: string
    ) => {
      setPaymentIsLoading(true);
      setPaymentErrorReason(undefined);
      const res = await fetchPostJson({
        path: "/payment/create-payment",
        isSecure: true,
        data: {
          type,
          phone,
          promocode: promocode?.trim().toLowerCase(),
          email,
        },
      });
      try {
        const data = await res.json();
        if (data?.success) {
          setPaymentStatus("success");
        } else {
          setPaymentStatus("error");
          setPaymentErrorReason(data?.reason);
        }
        return data;
      } catch (e) {
        setPaymentStatus("error");
        setPaymentErrorReason(undefined);
      } finally {
        setPaymentIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (paymentStatus === "success") {
      getSubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  const createPayTodayBill = useCallback(async (internalPaymentId: string) => {
    let res = await fetchGet({
      path: "/payment/createPayTodayBill?paymentId=" + internalPaymentId,
      isSecure: true,
    });
    res = await res.json();
    return res;
  }, []);

  return {
    paymentIsLoading,
    paymentStatus,
    paymentErrorReason,
    createPayment,
    createPayTodayBill,
  };
};
