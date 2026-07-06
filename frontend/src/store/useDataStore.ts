import { create } from 'zustand'
import type {
  Account,
  Activity,
  Campaign,
  Contact,
  Contract,
  EndUser,
  Lead,
  Opportunity,
  Order,
  Payment,
  Product,
  User,
} from '../mocks/crmData'
import { storageService } from '../services/storageService'

interface DataState {
  version: number
  loading: boolean
  accounts: Account[]
  opportunities: Opportunity[]
  orders: Order[]
  contacts: Contact[]
  payments: Payment[]
  contracts: Contract[]
  campaigns: Campaign[]
  leads: Lead[]
  products: Product[]
  users: User[]
  activities: Activity[]
  endUsers: EndUser[]
  load: () => Promise<void>
  refresh: () => Promise<void>
  addAccount: (account: Account) => void
  addContact: (contact: Contact) => void
  addOpportunity: (opportunity: Opportunity) => void
  addOrder: (order: Order) => void
  addLead: (lead: Lead) => void
  addCampaign: (campaign: Campaign) => void
  addContract: (contract: Contract) => void
  addPayment: (payment: Payment) => void
  addActivity: (activity: Activity) => void
  addEndUser: (endUser: EndUser) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  version: 0,
  loading: false,
  accounts: [],
  opportunities: [],
  orders: [],
  contacts: [],
  payments: [],
  contracts: [],
  campaigns: [],
  leads: [],
  products: [],
  users: [],
  activities: [],
  endUsers: [],
  load: async () => {
    const [accounts, opportunities, orders, contacts, payments, contracts, campaigns, leads, products, users, activities, endUsers] =
      await Promise.all([
        storageService.accounts.getAll(),
        storageService.opportunities.getAll(),
        storageService.orders.getAll(),
        storageService.contacts.getAll(),
        storageService.payments.getAll(),
        storageService.contracts.getAll(),
        storageService.campaigns.getAll(),
        storageService.leads.getAll(),
        storageService.products.getAll(),
        storageService.users.getAll(),
        storageService.activities.getAll(),
        storageService.endUsers.getAll(),
      ])
    set({
      accounts,
      opportunities,
      orders,
      contacts,
      payments,
      contracts,
      campaigns,
      leads,
      products,
      users,
      activities,
      endUsers,
      version: get().version + 1,
    })
  },
  refresh: async () => {
    await useDataStore.getState().load()
  },
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  addOpportunity: (opportunity) => set((state) => ({ opportunities: [...state.opportunities, opportunity] })),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  addContract: (contract) => set((state) => ({ contracts: [...state.contracts, contract] })),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
  addEndUser: (endUser) => set((state) => ({ endUsers: [...state.endUsers, endUser] })),
}))
