"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";

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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LangAttribute />
      {children}
    </I18nextProvider>
  );
}
