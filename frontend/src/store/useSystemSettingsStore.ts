import { create } from 'zustand'
import { defaultSystemSettings, type SystemSettings } from '../mocks/crmData'
import { storageService } from '../services/storageService'

const SETTINGS_ID = 'global'

type SystemSettingsPatch = Partial<Omit<SystemSettings, 'id'>>

interface SystemSettingsState {
  settings: SystemSettings
  loading: boolean
  load: () => Promise<void>
  save: (patch: SystemSettingsPatch) => Promise<SystemSettings>
  preview: (patch: SystemSettingsPatch) => void
  apply: (settings?: SystemSettings) => void
}

function applySettings(settings: SystemSettings): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--angel-red', settings.primaryColor)
  root.style.setProperty('--angel-dred', settings.dangerColor)
  root.style.setProperty('--surface-page', settings.pageBackground)
  root.style.setProperty('--surface-dark', settings.sidebarBackground)
  root.style.setProperty('--surface-dark-active', settings.sidebarActiveBackground)
  root.style.setProperty('--font-base', settings.fontFamily)
}

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => ({
  settings: defaultSystemSettings,
  loading: false,
  apply: (settings) => applySettings(settings ?? get().settings),
  preview: (patch) => {
    const next = {
      ...get().settings,
      ...patch,
    }
    set({ settings: next })
    applySettings(next)
  },
  load: async () => {
    set({ loading: true })
    try {
      const settings = await storageService.systemSettings.getById(SETTINGS_ID)
      const merged = { ...defaultSystemSettings, ...(settings ?? {}) }
      set({ settings: merged })
      applySettings(merged)
    } catch {
      set({ settings: defaultSystemSettings })
      applySettings(defaultSystemSettings)
    } finally {
      set({ loading: false })
    }
  },
  save: async (patch) => {
    const next = {
      ...get().settings,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    set({ settings: next })
    applySettings(next)

    try {
      const saved = await storageService.systemSettings.update(SETTINGS_ID, next)
      const merged = { ...next, ...(saved ?? {}) }
      set({ settings: merged })
      applySettings(merged)
      return merged
    } catch (error) {
      await get().load()
      throw error
    }
  },
}))
