import { SibscribeContext } from "@/subscribe/context";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

export const useCheckSubscription = () => {
  const { subscription } = useContext(SibscribeContext);
  const router = useRouter();

  const checkSubscription = useCallback(() => {
    if (subscription === undefined) {
      return true;
    }
    if (!subscription?.success) {
      router.push("/subscription");
      return false;
    }
    return true;
  }, [router, subscription]);

  return { checkSubscription };
};
