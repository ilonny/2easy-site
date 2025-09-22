"use client";
import { checkResponse, fetchGet } from "@/api";
import { AuthContext } from "@/auth";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const SibscribeContext = createContext({});

export const SibscribeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscription, setSubscription] = useState(undefined);
  const pathname = usePathname();
  const profile = useContext(AuthContext)?.profile;

  const getSubscribe = async () => {
    const res = await fetchGet({
      path: "/subscription",
      isSecure: true,
    });
    const data = await res?.json();
    if (data) {
      setSubscription(data);
    }

    if (!!profile?.name && !profile.studentId) {
      checkResponse(data);
    }
    return data;
  };

  useEffect(() => {
    if (!profile?.name) {
      return;
    }

    getSubscribe();
  }, [pathname, profile?.name]);
  return (
    <SibscribeContext.Provider value={{ subscription, getSubscribe }}>
      {children}
    </SibscribeContext.Provider>
  );
};
