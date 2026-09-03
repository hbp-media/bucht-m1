import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import de from "./locales/de";
import en from "./locales/en";
import cs from "./locales/cs";
import sk from "./locales/sk";

export const LANGUAGES = [
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "en", label: "EN", name: "English" },
  { code: "cs", label: "CS", name: "Čeština" },
  { code: "sk", label: "SK", name: "Slovenčina" },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      cs: { translation: cs },
      sk: { translation: sk },
    },
    fallbackLng: "de",
    supportedLngs: LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "bm1_lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
