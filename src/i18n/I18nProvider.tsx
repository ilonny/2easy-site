"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";
import { loadRemoteTranslationsIntoI18n } from "./remote";
import { Skeleton } from "@nextui-org/react";

function detectAndSetLanguage() {
  // IMPORTANT: RU is the default language regardless of system/browser language.
  // If user explicitly switched language (stored in localStorage), respect it.
  let resolved: "ru" | "en" = "ru";
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("i18nextLng") || "";
      if (stored.toLowerCase().startsWith("en")) resolved = "en";
      if (stored.toLowerCase().startsWith("ru")) resolved = "ru";
    }
  } catch {}
  if (resolved !== i18n.language) i18n.changeLanguage(resolved);
}

function LangAttribute() {
  useEffect(() => {
    detectAndSetLanguage();
    const updateLang = () => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = i18n.language?.startsWith("ru")
          ? "ru"
          : "en";
      }
    };
    updateLang();
    i18n.on("languageChanged", updateLang);
    return () => i18n.off("languageChanged", updateLang);
  }, []);
  return null;
}

function I18nLoadingSkeleton() {
  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100dvh" }}>
      <div className="w-full max-w-[1200px] mx-auto px-4 py-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="rounded-lg">
            <div className="h-10 w-[160px]" />
          </Skeleton>
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="rounded-lg">
                <div className="h-6 w-[110px]" />
              </Skeleton>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-lg">
              <div className="h-9 w-[120px]" />
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-9 w-[120px]" />
            </Skeleton>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="mt-10">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="rounded-lg">
              <div className="h-5 w-[260px]" />
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-12 w-[min(720px,100%)]" />
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-10 w-[min(560px,100%)]" />
            </Skeleton>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl">
                <div className="h-[180px] w-full" />
              </Skeleton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Ensure language is set before loading translations.
        detectAndSetLanguage();
        await loadRemoteTranslationsIntoI18n();
      } catch {
        // If API is temporarily unavailable, we still render with bundled dictionary.
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <LangAttribute />
      {ready ? children : <I18nLoadingSkeleton />}
    </I18nextProvider>
  );
}
