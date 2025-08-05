import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en.json";
import zhCN from "./i18n/zh-CN.json";
import zhTW from "./i18n/zh-TW.json";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "zh-TW": { translation: zhTW },
    "zh-CN": { translation: zhCN },
  },
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "zh-TW", "zh-CN"], // 支援的語言
  interpolation: {
    escapeValue: false, // React 已處理 XSS
  },
  react: {
    useSuspense: false, // React Native 不支援 Suspense
  },
});

export default i18next;
