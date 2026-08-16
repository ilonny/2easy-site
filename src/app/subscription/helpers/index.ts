import { AuthContext } from "@/auth";
import i18n from "@/i18n/config";
import { SibscribeContext } from "@/subscribe/context";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import { toast } from "react-toastify";

const isPaidActiveSubscription = (subscription: {
  success?: boolean;
  subscribe_type_id?: number;
} | null | undefined) =>
  Boolean(
    subscription?.success &&
      subscription?.subscribe_type_id &&
      subscription.subscribe_type_id !== 1,
  );

export const useCheckSubscription = () => {
  const { subscription } = useContext(SibscribeContext);
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();

  const checkSubscription = useCallback(() => {
    if (!authIsLoading && !profile?.login && !profile?.studentId) {
      router.push("/subscription");
      return false;
    }
    if (subscription === undefined) {
      return true;
    }
    if (!subscription?.success) {
      router.push("/subscription");
      return false;
    }
    return true;
  }, [authIsLoading, profile?.login, profile?.studentId, router, subscription]);

  const requireAiSubscription = useCallback(() => {
    const message = i18n.t("ai.needPaidSubscription", {
      defaultValue: "AI работает только с активной платной подпиской",
    });
    if (!authIsLoading && !profile?.login && !profile?.studentId) {
      toast(message, { type: "error" });
      router.push("/subscription");
      return false;
    }
    if (subscription === undefined) {
      return true;
    }
    if (!isPaidActiveSubscription(subscription)) {
      toast(message, { type: "error" });
      router.push("/subscription");
      return false;
    }
    return true;
  }, [authIsLoading, profile?.login, profile?.studentId, router, subscription]);

  const hasSubscription = subscription?.success;
  const hasPaidAiSubscription = isPaidActiveSubscription(subscription);

  return {
    checkSubscription,
    requireAiSubscription,
    subscription,
    hasSubscription,
    hasPaidAiSubscription,
  };
};
