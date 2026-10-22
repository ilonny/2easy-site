"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const safeInternalPath = (value: string | null, fallback: string) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;

const isSchoolHome = (path: string) =>
  path === "/school" || path.startsWith("/school?");

export const useSchoolBack = (fallback = "/school?tab=stats") => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get("returnTo"), fallback);
  const target = isSchoolHome(returnTo) ? returnTo : fallback;

  return useCallback(() => {
    router.replace(target);
  }, [router, target]);
};
