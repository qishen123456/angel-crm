import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import zhCN from './zh-CN.json'
import zhHK from './zh-HK.json'
import enUS from './en-US.json'
import thTH from './th-TH.json'
import idID from './id-ID.json'
import viVN from './vi-VN.json'

export const defaultNS = 'translation'

export const resources = {
  'zh-CN': { [defaultNS]: zhCN },
  'zh-HK': { [defaultNS]: zhHK },
  'en-US': { [defaultNS]: enUS },
  'th-TH': { [defaultNS]: thTH },
  'id-ID': { [defaultNS]: idID },
  'vi-VN': { [defaultNS]: viVN },
} as const

export type LocaleKey = keyof typeof resources

export const localeNames: Record<LocaleKey, string> = {
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文',
  'en-US': 'English',
  'th-TH': 'ภาษาไทย',
  'id-ID': 'Bahasa Indonesia',
  'vi-VN': 'Tiếng Việt',
}

function normalizeLocale(raw: string | undefined): LocaleKey {
  if (!raw) return 'zh-CN'
  const map: Record<string, LocaleKey> = {
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-cn': 'zh-CN',
    'zh-HK': 'zh-HK',
    'zh-hk': 'zh-HK',
    'zh-TW': 'zh-HK',
    'zh-tw': 'zh-HK',
    'en': 'en-US',
    'en-US': 'en-US',
    'en-us': 'en-US',
    'th': 'th-TH',
    'th-TH': 'th-TH',
    'th-th': 'th-TH',
    'id': 'id-ID',
    'id-ID': 'id-ID',
    'id-id': 'id-ID',
    'vi': 'vi-VN',
    'vi-VN': 'vi-VN',
    'vi-vn': 'vi-VN',
  }
  return map[raw] || 'zh-CN'
}

const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') : undefined
const initialLocale = normalizeLocale(savedLocale || navigator.language)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    fallbackLng: 'zh-CN',
    defaultNS,
    ns: [defaultNS],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'locale',
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', lng)
  }
})

export default i18n
export { i18n }
