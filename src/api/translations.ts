"use client";

import { fetchGet, fetchPostJson } from "@/api";
import { BASE_URL } from "@/api";
import { API_URL } from "@/api";

export type TranslationsPayload = {
  success: boolean;
  ru?: Record<string, any>;
  en?: Record<string, any>;
  message?: string;
};

export async function apiGetTranslations(): Promise<TranslationsPayload> {
  // Prefer public endpoint without /api to avoid proxy auth rules.

  try {
    const base = (BASE_URL || "").replace("/undefined", "");
    if (base) {
      const res = await fetch(`${base}/translations`, {
        method: "GET",
        cache: "no-store",
      });
      // If it's blocked (401/403), fallback to /api/translations below.
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}

  // Fallback to /api/translations (also no-store to avoid stale cache)
  try {
    const res = await fetch(`${API_URL}/translations`, {
      method: "GET",
      cache: "no-store",
    });
    return await res.json();
  } catch {}

  const res = await fetchGet({ path: "/translations" });
  return await res.json();
}

export async function apiUpdateTranslationKey(params: {
  key: string;
  ru: string;
  en: string;
}) {
  const res = await fetchPostJson({
    path: "/translations",
    isSecure: true,
    data: params,
  });
  return await res.json();
}
