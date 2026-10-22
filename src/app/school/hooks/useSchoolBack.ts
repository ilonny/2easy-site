"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  schoolHomePath,
  tabFromSchoolPath,
  writeLastSchoolTab,
} from "../lib/schoolTab";

const safeInternalPath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "";

export const useSchoolBack = (fallback?: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeInternalPath(searchParams.get("returnTo"));

  return useCallback(() => {
    const target = returnTo || fallback || schoolHomePath();
    const tab = tabFromSchoolPath(target);
    if (tab) writeLastSchoolTab(tab);
    router.replace(target);
  }, [fallback, returnTo, router]);
};
