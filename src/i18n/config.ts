import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

const supportedLngs = ["ru", "en"] as const;

const initOptions = {
  resources,
  fallbackLng: "ru",
  lng: "ru",
  supportedLngs,
  interpolation: {
    escapeValue: false,
  },
};

i18n.use(initReactI18next);
i18n.init(initOptions);

export default i18n;
