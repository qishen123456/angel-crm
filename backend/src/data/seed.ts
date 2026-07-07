import { createStore } from './jsonStore.js'
import {
  accounts,
  activities,
  annualTargets,
  attendanceRecords,
  auditLogs,
  campaigns,
  contacts,
  contracts,
  dailyReports,
  documentTemplates,
  endUsers,
  invoices,
  leads,
  notifications,
  opportunities,
  orders,
  payments,
  products,
  projectUpdates,
  retailMonthly,
  users,
} from './seedData.js'

export async function seedAll(): Promise<void> {
  await createStore('users').seed(users)
  await createStore('accounts').seed(accounts)
  await createStore('contacts').seed(contacts)
  await createStore('campaigns').seed(campaigns)
  await createStore('leads').seed(leads)
  await createStore('opportunities').seed(opportunities)
  await createStore('orders').seed(orders)
  await createStore('contracts').seed(contracts)
  await createStore('payments').seed(payments)
  await createStore('invoices').seed(invoices)
  await createStore('products').seed(products)
  await createStore('endUsers').seed(endUsers)
  await createStore('projectUpdates').seed(projectUpdates)
  await createStore('activities').seed(activities)
  await createStore('notifications').seed(notifications)
  await createStore('documentTemplates').seed(documentTemplates)
  await createStore('retailMonthly').seed(retailMonthly)
  await createStore('dailyReports').seed(dailyReports)
  await createStore('attendanceRecords').seed(attendanceRecords)
  await createStore('auditLogs').seed(auditLogs)
  await createStore('annualTargets').seed(annualTargets)
}
