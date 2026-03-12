"use client";

import { useTranslation } from "react-i18next";
import { Button, ButtonGroup } from "@nextui-org/react";

const languages = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith("ru") ? "ru" : "en";

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

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
