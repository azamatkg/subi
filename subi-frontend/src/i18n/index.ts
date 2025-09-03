import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { STORAGE_KEYS } from '@/constants';

// Translation resources
import kg from './locales/kg.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const resources = {
  kg: { translation: kg },
  ru: { translation: ru },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Russian as fallback since it's widely used in the region
    lng: localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ru',
    
    detection: {
      // Detection options
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
    },

    interpolation: {
      escapeValue: false, // React already protects from XSS
    },

    // Namespace options
    defaultNS: 'translation',
    ns: ['translation'],

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === 'development',

    // React options
    react: {
      useSuspense: false, // We'll handle loading states manually
    },
  });

// Export for use in components
export default i18n;