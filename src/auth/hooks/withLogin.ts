import { useContext, useEffect } from "react";
import { AuthContext } from "../context";
import { readFromLocalStorage } from "../utils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";

export const withLogin = () => {
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authIsLoading) return;
    if (profile?.login || profile?.studentId || profile?.email) return;
    // Profile is restored from storage in the same tick as authIsLoading.
    // Don't send a still-logged-in student to /login during that handoff.
    if (readFromLocalStorage("profile")) return;
    toast(i18n.t("auth.authError"), {
      type: "success",
    });
    router.push("/login");
  }, [authIsLoading, profile, router]);
};
