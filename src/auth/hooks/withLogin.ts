import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const withLogin = () => {
  const { t } = useTranslation();
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !profile?.login && !profile?.studentId) {
      toast(t("auth.authError"), {
        type: "success",
      });
      router.push("/login");
    }
  }, [authIsLoading, profile, router, t]);
};
