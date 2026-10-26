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

type TProfileLike = {
  isStudent?: boolean;
  studentId?: number;
} | null | undefined;

/** Students access lessons via teacher assignment, not subscription. */
export const isStudentUser = (profile: TProfileLike) =>
  Boolean(profile?.isStudent || profile?.studentId);

/** Trial (`subscribe_type_id === 1`) cannot open paid 2easy catalog lessons. */
export const isLessonLockedOnFreeTariff = (
  lesson: TTrialLockLesson,
  isFreeTariff?: boolean,
  isStudent?: boolean,
) =>
  Boolean(
    !isStudent &&
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
    if (isStudentUser(profile)) {
      return true;
    }
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
  }, [authIsLoading, profile, router, subscription]);

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

  const hasSubscription =
    isStudentUser(profile) || Boolean(subscription?.success);
  const hasPaidAiSubscription = isPaidActiveSubscription(subscription);

  return {
    checkSubscription,
    requireAiSubscription,
    subscription,
    hasSubscription,
    hasPaidAiSubscription,
  };
};

export type TUserAccess =
  | "loading"
  | "guest"
  | "student"
  | "noSubscription"
  | "subscribed";

type TPlanSubscription = {
  success?: boolean;
  subscribe_type_id?: number;
  hasPersonalSubscription?: boolean;
  isSchoolSubscription?: boolean;
  school_id?: number;
} | null;

/** Personal plan vs school-only membership. `loading` until /subscription resolves. */
export const useTeacherPlan = () => {
  const { subscription } = useContext(SibscribeContext) as {
    subscription?: TPlanSubscription;
  };
  const { authIsLoading, profile } = useContext(AuthContext);
  const loading =
    authIsLoading ||
    (!!profile?.name && !isStudentUser(profile) && subscription === undefined);
  const hasPersonalSubscription = loading
    ? undefined
    : subscription?.hasPersonalSubscription === true ||
      (subscription?.hasPersonalSubscription == null &&
        Boolean(subscription?.success) &&
        !subscription?.isSchoolSubscription);
  const hasSchool =
    (Array.isArray(profile?.schools) && profile.schools.length > 0) ||
    Number(profile?.schoolId) > 0 ||
    Boolean(subscription?.isSchoolSubscription) ||
    Number(subscription?.school_id) > 0;
  const schoolOnly =
    !loading && hasPersonalSubscription === false && hasSchool;
  return {
    loading,
    hasPersonalSubscription,
    hasSchool,
    schoolOnly,
    subscription,
  };
};

/** `subscription === undefined` means the teacher's subscription is still being fetched. */
export const useUserAccess = (): TUserAccess => {
  const { subscription } = useContext(SibscribeContext) as {
    subscription?: { success?: boolean } | null;
  };
  const { authIsLoading, profile } = useContext(AuthContext);

  if (authIsLoading) return "loading";
  if (!profile?.name) return "guest";
  if (isStudentUser(profile)) return "student";
  if (subscription === undefined) return "loading";
  return subscription?.success ? "subscribed" : "noSubscription";
};

export const useRedirectIfLessonLockedOnTrial = (lesson: TTrialLockLesson) => {
  const { subscription } = useCheckSubscription();
  const { schoolOnly, loading } = useTeacherPlan();
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const isStudent = isStudentUser(profile);
  const isLocked = isLessonLockedOnFreeTariff(
    lesson,
    subscription?.subscribe_type_id === 1,
    isStudent,
  );

  useEffect(() => {
    if (!isLocked || loading || schoolOnly) return;
    router.replace("/subscription");
  }, [isLocked, loading, router, schoolOnly]);

  return isLocked;
};
