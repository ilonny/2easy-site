import { useContext, useEffect } from "react";
import { AuthContext } from "../context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";

export const withLogin = () => {
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !profile?.login && !profile?.studentId) {
      toast(i18n.t("auth.authError"), {
        type: "success",
      });
      router.push("/login");
    }
  }, [authIsLoading, profile, router]);
};
