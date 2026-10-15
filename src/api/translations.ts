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

// Slow or filtered routes (e.g. from abroad) can leave a TCP connection hanging forever.
const TRANSLATIONS_ATTEMPT_TIMEOUT_MS = 6000;

async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs = TRANSLATIONS_ATTEMPT_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGetTranslations(): Promise<TranslationsPayload> {
  // Prefer public endpoint without /api to avoid proxy auth rules.

  try {
    const base = (BASE_URL || "").replace("/undefined", "");
    if (base) {
      const payload = await withTimeout(async (signal) => {
        const res = await fetch(`${base}/translations`, {
          method: "GET",
          cache: "no-store",
          signal,
        });
        // If it's blocked (401/403), fallback to /api/translations below.
        return res.ok ? await res.json() : null;
      });
      if (payload) {
        return payload;
      }
    }
  } catch {}

  // Fallback to /api/translations (also no-store to avoid stale cache)
  try {
    return await withTimeout(async (signal) => {
      const res = await fetch(`${API_URL}/translations`, {
        method: "GET",
        cache: "no-store",
        signal,
      });
      return await res.json();
    });
  } catch {}

  return await withTimeout(async (signal) => {
    const res = await fetchGet({ path: "/translations", signal });
    return await res.json();
  });
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
