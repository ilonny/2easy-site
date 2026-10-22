"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const safeInternalPath = (value: string | null, fallback: string) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;

export const useSchoolBack = (fallback = "/school?tab=stats") => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get("returnTo"), fallback);

  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(returnTo);
  }, [returnTo, router]);
};
