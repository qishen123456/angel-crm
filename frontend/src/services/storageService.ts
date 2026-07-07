import { apiClient } from '../api/client'
import type {
  Account,
  Activity,
  AttendanceRecord,
  Campaign,
  Contact,
  Contract,
  DailyReport,
  DocumentTemplate,
  EndUser,
  Invoice,
  Lead,
  Notification,
  Opportunity,
  Order,
  Payment,
  Product,
  ProjectUpdate,
  RetailMonthly,
  User,
} from '../mocks/crmData'

const AUTH_USER_KEY = 'angelcrm_auth_user'
const AUTH_TOKEN_KEY = 'angelcrm_auth_token'

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

function setUser(user: User): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function removeUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}

function getUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

async function getAll<T>(path: string): Promise<T[]> {
  const res = await apiClient.get<{ data: T[] }>(path)
  return res.data.data ?? []
}

async function getById<T>(path: string, id: string): Promise<T | undefined> {
  const res = await apiClient.get<{ data: T }>(`${path}/${id}`)
  return res.data.data
}

async function create<T>(path: string, data: Omit<T, 'id'> & Partial<{ id: string }>): Promise<T> {
  const res = await apiClient.post<{ data: T }>(path, data)
  return res.data.data
}

async function update<T>(path: string, id: string, data: Partial<T>): Promise<T | undefined> {
  const res = await apiClient.patch<{ data: T }>(`${path}/${id}`, data)
  return res.data.data
}

async function deleteItem(path: string, id: string): Promise<boolean> {
  await apiClient.delete(`${path}/${id}`)
  return true
}

function createApiRepository<T extends { id: string }>(path: string) {
  return {
    getAll: () => getAll<T>(path),
    getById: (id?: string) => (id ? getById<T>(path, id) : Promise.resolve(undefined)),
    create: (data: Omit<T, 'id'> & Partial<{ id: string }>) => create<T>(path, data),
    update: (id: string, data: Partial<T>) => update<T>(path, id, data),
    delete: (id: string) => deleteItem(path, id),
  }
}

const accountRepo = createApiRepository<Account>('/accounts')
const opportunityRepo = createApiRepository<Opportunity>('/opportunities')
const orderRepo = createApiRepository<Order>('/orders')
const contactRepo = createApiRepository<Contact>('/contacts')
const activityRepo = createApiRepository<Activity>('/activities')
const paymentRepo = createApiRepository<Payment>('/payments')
const invoiceRepo = createApiRepository<Invoice>('/invoices')
const contractRepo = createApiRepository<Contract>('/contracts')
const campaignRepo = createApiRepository<Campaign>('/campaigns')
const leadRepo = createApiRepository<Lead>('/leads')
const productRepo = createApiRepository<Product>('/products')
const userRepo = createApiRepository<User>('/users')
const endUserRepo = createApiRepository<EndUser>('/endUsers')
const projectUpdateRepo = createApiRepository<ProjectUpdate>('/projectUpdates')
const retailMonthlyRepo = createApiRepository<RetailMonthly>('/retailMonthly')
const documentTemplateRepo = createApiRepository<DocumentTemplate>('/documentTemplates')
const notificationRepo = createApiRepository<Notification>('/notifications')
const dailyReportRepo = createApiRepository<DailyReport>('/dailyReports')
const attendanceRecordRepo = createApiRepository<AttendanceRecord>('/attendanceRecords')

export const storageService = {
  accounts: {
    ...accountRepo,
    getByAccount: (accountId: string) =>
      getAll<Account>('/accounts').then((items) => items.filter((item) => item.id === accountId)),
  },
  opportunities: {
    ...opportunityRepo,
    getByAccount: (accountId: string) =>
      getAll<Opportunity>('/opportunities').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  orders: {
    ...orderRepo,
    getByAccount: (accountId: string) =>
      getAll<Order>('/orders').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  contacts: {
    ...contactRepo,
    getByAccount: (accountId: string) =>
      getAll<Contact>('/contacts').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  activities: {
    ...activityRepo,
    getByAccount: (accountId: string) =>
      getAll<Activity>('/activities').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  payments: {
    ...paymentRepo,
    getByAccount: (accountId: string) =>
      getAll<Payment>('/payments').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  invoices: invoiceRepo,
  contracts: {
    ...contractRepo,
    getByAccount: (accountId: string) =>
      getAll<Contract>('/contracts').then((items) => items.filter((item) => item.accountId === accountId)),
  },
  campaigns: campaignRepo,
  leads: leadRepo,
  products: productRepo,
  users: {
    ...userRepo,
    getByEmail: (email: string) =>
      getAll<User>('/users').then((items) =>
        items.find((user) => user.email.toLowerCase() === email.toLowerCase())
      ),
  },
  endUsers: endUserRepo,
  projectUpdates: projectUpdateRepo,
  retailMonthly: retailMonthlyRepo,
  documentTemplates: documentTemplateRepo,
  notifications: notificationRepo,
  dailyReports: dailyReportRepo,
  attendanceRecords: attendanceRecordRepo,
  auth: {
    login: async (email: string, password: string) => {
      try {
        const res = await apiClient.post<{ success: boolean; user: User; token: string }>('/auth/login', {
          email,
          password,
        })
        if (!res.data.success || !res.data.token) {
          return { success: false as const }
        }
        setToken(res.data.token)
        setUser(res.data.user)
        return { success: true as const, user: res.data.user }
      } catch {
        return { success: false as const }
      }
    },
    logout: () => {
      removeToken()
      removeUser()
    },
    getUser,
    isLoggedIn: () => !!getToken() && !!getUser(),
    getToken,
  },
}
