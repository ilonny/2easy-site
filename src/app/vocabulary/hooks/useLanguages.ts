"use client";

import { fetchGet } from "@/api";
import { useCallback, useState } from "react";
import { TLanguage } from "../types";

export const useLanguages = () => {
  const [languages, setLanguages] = useState<TLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getLanguages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchGet({
        path: "/languages?isActive=true",
        isSecure: true,
      });
      const data = await res?.json();
      setLanguages(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { languages, getLanguages, isLoading };
};
