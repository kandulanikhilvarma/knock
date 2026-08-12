import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import te from '../locales/te.json';
import hi from '../locales/hi.json';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
};

// Device language if it's one we support, else English (§0: English default).
const device = getLocales()[0]?.languageCode ?? 'en';
const lng = device in resources ? device : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Restore a previously chosen language, if any.
AsyncStorage.getItem('app.lang')
  .then((saved) => {
    if (saved && saved in resources && saved !== i18n.language) i18n.changeLanguage(saved);
  })
  .catch(() => {});

export default i18n;
