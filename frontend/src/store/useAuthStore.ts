import { create } from 'zustand'
import type { User } from '../mocks/crmData'
import { storageService } from '../services/storageService'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  init: () => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storageService.auth.getUser() ?? null,
  isLoggedIn: storageService.auth.isLoggedIn(),
  init: () => {
    const user = storageService.auth.getUser()
    set({ user: user ?? null, isLoggedIn: !!user && storageService.auth.isLoggedIn() })
  },
  login: async (email, password) => {
    const result = await storageService.auth.login(email, password)
    if (!result.success) {
      set({ user: null, isLoggedIn: false })
      return false
    }
    set({ user: result.user, isLoggedIn: true })
    return true
  },
  logout: () => {
    storageService.auth.logout()
    set({ user: null, isLoggedIn: false })
  },
}))
