"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import i18n from "./config";

function detectAndSetLanguage() {
  const detector = new LanguageDetector();
  detector.init(undefined, {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
  });
  const lng = detector.detect();
  const raw = Array.isArray(lng) ? lng[0] : lng;
  const resolved = raw?.toString().startsWith("ru") ? "ru" : "en";
  if (resolved !== i18n.language) {
    i18n.changeLanguage(resolved);
  }
}

function LangAttribute() {
  useEffect(() => {
    detectAndSetLanguage();
    const updateLang = () => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = i18n.language?.startsWith("ru") ? "ru" : "en";
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
