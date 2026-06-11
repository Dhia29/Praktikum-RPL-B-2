import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationID from './locales/id/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  id: {
    translation: translationID
  }
};

import axios from 'axios';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    supportedLngs: ['en', 'id'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage'], // Remove navigator to avoid auto-switching to English OS
      caches: ['localStorage'],
      lookupLocalStorage: 'app_language',
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Set default header initially
axios.defaults.headers.common['Accept-Language'] = i18n.language;

// Update header whenever language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app_language', lng);
  axios.defaults.headers.common['Accept-Language'] = lng;
});

export default i18n;
