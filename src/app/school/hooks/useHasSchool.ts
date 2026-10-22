"use client";

import { fetchGet } from "@/api";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";

export const useHasSchool = () => {
  const { profile } = useContext(AuthContext);
  const fromProfile = Array.isArray(profile?.schools)
    ? profile.schools.length > 0
    : Number(profile?.schoolId) > 0;
  const [hasSchool, setHasSchool] = useState(fromProfile);

  useEffect(() => {
    if (profile?.isStudent || profile?.studentId) {
      setHasSchool(false);
      return;
    }
    if (fromProfile) {
      setHasSchool(true);
      return;
    }
    if (!profile?.id && !profile?.login) {
      setHasSchool(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchGet({
          path: "/school/me",
          isSecure: true,
        });
        const data = await res?.json();
        if (!cancelled) {
          setHasSchool(
            !!data?.success &&
              Array.isArray(data.schools) &&
              data.schools.length > 0,
          );
        }
      } catch {
        if (!cancelled) setHasSchool(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    fromProfile,
    profile?.id,
    profile?.isStudent,
    profile?.login,
    profile?.studentId,
  ]);

  return hasSchool;
};
