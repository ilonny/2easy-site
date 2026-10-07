"use client";

import { Button, ButtonGroup } from "@nextui-org/react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "ru", label: "RU", brandLabel: "RU" },
  { code: "en", label: "EN", brandLabel: "ENG" },
] as const;

type TProps = {
  variant?: "default" | "brand" | "brandMenu";
};

export function LanguageSwitcher({ variant = "default" }: TProps) {
  const { i18n } = useTranslation();
  const raw = (i18n.resolvedLanguage || i18n.language || "ru").toLowerCase();
  const currentLang = raw.startsWith("ru") ? "ru" : "en";

  const handleChange = (lang: string) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("i18nextLng", lang);
      }
    } catch {}
    void i18n.changeLanguage(lang);
  };

  if (variant === "brand" || variant === "brandMenu") {
    const isMenu = variant === "brandMenu";
    return (
      <div
        className={`flex h-10 items-center gap-1 rounded-[11px] p-0.5 ${
          isMenu ? "" : "bg-brand-gray"
        }`}
      >
        {languages.map(({ code, brandLabel }) => {
          const isActive = currentLang === code;
          return (
            <button
              key={code}
              type="button"
              className={`flex h-full items-center justify-center rounded-[11px] px-3.5 uppercase tracking-brand transition-colors ${
                isMenu ? "text-sm leading-[1.3]" : "text-[11px] leading-none"
              } ${
                isActive
                  ? "bg-white font-bold text-brand-violet"
                  : `${isMenu ? "font-bold" : "font-extrabold"} text-brand-grayFont hover:text-brand-black`
              }`}
              onClick={() => handleChange(code)}
              aria-pressed={isActive}
              aria-label={`Switch to ${code === "ru" ? "Russian" : "English"}`}
            >
              {brandLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <ButtonGroup
      size="sm"
      variant="flat"
      className="bg-gray-100 border border-gray-200 shadow-sm"
    >
      {languages.map(({ code, label }) => (
        <Button
          key={code}
          size="sm"
          variant="flat"
          color={currentLang === code ? "primary" : "default"}
          className={
            currentLang === code
              ? "min-w-10 font-medium bg-white text-primary shadow-sm"
              : "min-w-10 bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }
          onPress={() => handleChange(code)}
          aria-pressed={currentLang === code}
          aria-label={`Switch to ${code === "ru" ? "Russian" : "English"}`}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
