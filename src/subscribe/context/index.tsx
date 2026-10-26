"use client";
import { checkResponse, fetchGet } from "@/api";
import { AuthContext } from "@/auth";
import { subscriptionFromSchoolMemberships } from "@/subscribe/schoolSubscription";
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
  const { profile, setProfile } = useContext(AuthContext);

  const getSubscribe = async () => {
    const res = await fetchGet({
      path: "/subscription",
      isSecure: true,
    });
    let data = await res?.json();
    // Explicit flag wins. Older API: a successful response without
    // isSchoolSubscription is a personal plan.
    const personalActive =
      typeof data?.hasPersonalSubscription === "boolean"
        ? data.hasPersonalSubscription
        : Boolean(data?.success) && !data?.isSchoolSubscription;
    const personalIsTrial = personalActive && data?.subscribe_type_id === 1;
    // School trial → free 2easy lessons; paid school tier → the full catalog.
    if (data && (!personalActive || personalIsTrial)) {
      try {
        const schoolRes = await fetchGet({
          path: "/school/me",
          isSecure: true,
        });
        const schoolData = await schoolRes?.json();
        const fromSchool = subscriptionFromSchoolMemberships(schoolData?.schools);
        if (fromSchool && !personalActive) {
          data = {
            ...data,
            ...fromSchool,
            hasPersonalSubscription: false,
          };
        } else if (
          fromSchool &&
          personalActive &&
          fromSchool.subscribe_type_id !== 1
        ) {
          data = {
            ...data,
            subscribe_type_id: fromSchool.subscribe_type_id,
            hasPersonalSubscription: true,
            isSchoolSubscription: true,
            school_tier: fromSchool.school_tier,
            school_materials_mode: fromSchool.school_materials_mode,
          };
        } else if (data) {
          data = { ...data, hasPersonalSubscription: personalActive };
        }
      } catch {
        if (data) data = { ...data, hasPersonalSubscription: personalActive };
      }
    } else if (data) {
      data = { ...data, hasPersonalSubscription: personalActive };
    }
    if (data) {
      setSubscription(data);
      if (data?.profile?.login) {
        setProfile?.(data?.profile);
      }
    }

    if (!!profile?.name && !profile?.studentId) {
      checkResponse(data, true);
    }
    return data;
  };

  useEffect(() => {
    if (!profile?.name || profile?.studentId) {
      return;
    }

    getSubscribe();
  }, [pathname, profile?.name, profile?.studentId]);
  return (
    <SibscribeContext.Provider value={{ subscription, getSubscribe }}>
      {children}
    </SibscribeContext.Provider>
  );
};
