import { AuthContext } from "@/auth";
import { SibscribeContext } from "@/subscribe/context";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

export const useCheckSubscription = () => {
  const { subscription } = useContext(SibscribeContext);
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();

  const checkSubscription = useCallback(() => {
    if (!authIsLoading && !profile?.login && !profile?.studentId) {
      router.push("/login");
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

  return { checkSubscription };
};
