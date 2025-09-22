"use client";
import { checkResponse, fetchGet } from "@/api";
import { usePathname } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const SibscribeContext = createContext({});

export const SibscribeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscription, setSubscription] = useState(undefined);
  const pathname = usePathname();
  const getSubscribe = async () => {
    const res = await fetchGet({
      path: "/subscription",
      isSecure: true,
    });
    const data = await res?.json();
    if (data) {
      setSubscription(data);
    }
    checkResponse(data);
    return data;
  };

  useEffect(() => {
    getSubscribe();
  }, [pathname]);
  return (
    <SibscribeContext.Provider value={{ subscription, getSubscribe }}>
      {children}
    </SibscribeContext.Provider>
  );
};
