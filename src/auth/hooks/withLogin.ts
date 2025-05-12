import { useContext, useEffect } from "react";
import { AuthContext } from "../context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const withLogin = () => {
  const { authIsLoading, profile } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    if (!authIsLoading && !profile?.login) {
      toast("Ошибка авторизации", {
        type: "success",
      });
      router.push("/login");
    }
  }, [authIsLoading, profile]);
};
