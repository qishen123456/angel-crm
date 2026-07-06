export type MenuItem = {
  key: string
  label: string
  badge?: number
}

export type MenuGroup = {
  key: string
  label: string
  items: MenuItem[]
}

export type LocaleBundle = {
  appName: string
  appSubName: string
  shellTitle: string
  shellTagline: string
  systemAdmin: string
  logout: string
  newButton: string
  languageLabel: string
  currentDate: string
  menu: MenuGroup[]
  pages: Record<string, string>
  common: Record<string, string>
  login: Record<string, string>
  accounts: Record<string, string>
  orders: Record<string, string>
  today: Record<string, any>
  settings: Record<string, any>
  createMenu: Record<string, string>
  dashboard: Record<string, any>
  pipeline: Record<string, string>
  campaigns: Record<string, string>
  leads: Record<string, string>
  accountDetail: Record<string, any>
  contacts: Record<string, string>
  contracts: Record<string, string>
  payments: Record<string, string>
  products: Record<string, string>
  workqueue: Record<string, any>
  pool: Record<string, string>
  endUsers: Record<string, string>
  team: Record<string, string>
  countryReports: Record<string, any>
  executiveReport: Record<string, any>
  retail: Record<string, any>
  projectUpdates: Record<string, any>
  importPage: Record<string, string>
  invite: Record<string, string>
  attendance: Record<string, string>
  logActivity: Record<string, string>
  invoices: Record<string, any>
  dailyReport?: Record<string, any>
}
