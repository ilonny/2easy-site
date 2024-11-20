import { fetchPostJson } from "@/api";
import { SibscribeContext } from "@/subscribe/context";
import { useCallback, useContext, useEffect, useState } from "react";

export const usePayment = () => {
  const { getSubscribe } = useContext(SibscribeContext);
  const [paymentIsLoading, setPaymentIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "error" | undefined
  >();

  const createPayment = useCallback(async (type: "month" | "year") => {
    setPaymentIsLoading(true);
    const res = await fetchPostJson({
      path: "/payment/create-payment",
      isSecure: true,
      data: {
        type,
      },
    });
    try {
      const data = await res.json();
      if (data?.success) {
        setPaymentStatus("success");
      } else {
        setPaymentStatus("error");
      }
    } catch (e) {
      setPaymentStatus("error");
    } finally {
      setPaymentIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (paymentStatus === "success") {
      getSubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  return { paymentIsLoading, paymentStatus, createPayment };
};
