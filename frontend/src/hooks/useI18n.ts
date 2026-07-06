import { useTranslation } from 'react-i18next'
import type { LocaleKey } from '../locales'
import type { LocaleBundle } from '../locales/types'

export function useI18n() {
  const { t: translate, i18n } = useTranslation()

  function t(key: string, vars?: Record<string, string | number>): string {
    return translate(key, vars as Record<string, any>) as string
  }

  const locale = i18n.language as LocaleKey
  const setLocale = (lng: LocaleKey) => i18n.changeLanguage(lng)

  // Provide a bundle-compatible object for code that previously read bundle.*
  const bundle = i18n.getResourceBundle(locale, 'translation') as LocaleBundle

  return { t, locale, setLocale, bundle }
}
