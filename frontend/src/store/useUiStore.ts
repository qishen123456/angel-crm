import { create } from 'zustand'
import type { LocaleKey } from '../locales'
import { i18n } from '../locales'

type UiState = {
  locale: LocaleKey
  setLocale: (locale: LocaleKey) => void
}

export const useUiStore = create<UiState>((set) => ({
  locale: i18n.language as LocaleKey,
  setLocale: (locale) => {
    i18n.changeLanguage(locale)
    set({ locale })
  },
}))

// Sync store when language changes outside of setLocale (e.g. on initial load)
i18n.on('languageChanged', (lng) => {
  useUiStore.setState({ locale: lng as LocaleKey })
})
