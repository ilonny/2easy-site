import { AuthContext } from "@/auth";
import i18n from "@/i18n/config";
import { SibscribeContext } from "@/subscribe/context";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";

export type TTrialLockLesson = {
  is_free?: string | boolean | number | null;
  user_id?: number;
  created_from_2easy?: number | boolean | null;
} | null | undefined;

/** Trial (`subscribe_type_id === 1`) cannot open paid 2easy catalog lessons. */
export const isLessonLockedOnFreeTariff = (
  lesson: TTrialLockLesson,
  isFreeTariff?: boolean,
) =>
  Boolean(
    isFreeTariff &&
      lesson &&
      !lesson.is_free &&
      (lesson.user_id === 1 || lesson.created_from_2easy),
  );

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

export const useRedirectIfLessonLockedOnTrial = (lesson: TTrialLockLesson) => {
  const { subscription } = useCheckSubscription();
  const router = useRouter();
  const isLocked = isLessonLockedOnFreeTariff(
    lesson,
    subscription?.subscribe_type_id === 1,
  );

  useEffect(() => {
    if (isLocked) {
      router.replace("/subscription");
    }
  }, [isLocked, router]);

  return isLocked;
};
