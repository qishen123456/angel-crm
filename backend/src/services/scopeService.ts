import { readJson } from '../data/jsonStore.js'
import type { AuthUser } from '../middleware/auth.js'
import { isSuperAdmin } from '../middleware/auth.js'

interface ScopedRecord {
  id?: string
  ownerId?: string
  userId?: string
  requestedById?: string
  loggedById?: string
  accountId?: string
  market?: string
  country?: string
  customerCountry?: string
}

interface AccountRecord {
  id: string
  ownerId?: string
  market?: string
}

const globalReadRoles = new Set(['Executive'])
const publicReadEntities = new Set(['users', 'products', 'notifications', 'documentTemplates', 'dailyReports'])

export async function applyReadScope<T extends ScopedRecord>(entity: string, items: T[], user?: AuthUser): Promise<T[]> {
  if (!user) return []
  if (isSuperAdmin(user) || globalReadRoles.has(user.role) || publicReadEntities.has(entity)) return items

  if (entity === 'accounts') {
    return items.filter((item) => belongsToUserOrMarket(item, user) || !item.ownerId)
  }

  if (entity === 'leads' || entity === 'campaigns') {
    return items.filter((item) => belongsToUserOrMarket(item, user))
  }

  if (entity === 'attendanceRecords') {
    return items.filter((item) => item.userId === user.id)
  }

  if (entity === 'contacts' || entity === 'opportunities' || entity === 'orders' || entity === 'contracts' || entity === 'payments' || entity === 'invoices' || entity === 'activities' || entity === 'endUsers' || entity === 'projectUpdates') {
    const visibleAccountIds = await getVisibleAccountIds(user)
    return items.filter((item) => item.accountId && visibleAccountIds.has(item.accountId))
  }

  return items.filter((item) => belongsToUserOrMarket(item, user))
}

export async function canReadRecord<T extends ScopedRecord>(entity: string, item: T, user?: AuthUser): Promise<boolean> {
  const scoped = await applyReadScope(entity, [item], user)
  return scoped.length > 0
}

function belongsToUserOrMarket(item: ScopedRecord, user: AuthUser): boolean {
  if (item.ownerId && item.ownerId === user.id) return true
  if (item.userId && item.userId === user.id) return true
  if (item.requestedById && item.requestedById === user.id) return true
  if (item.loggedById && item.loggedById === user.id) return true
  if (user.market && (item.market === user.market || item.country === user.market || item.customerCountry === user.market)) return true
  return false
}

async function getVisibleAccountIds(user: AuthUser): Promise<Set<string>> {
  const accounts = await readJson<AccountRecord>('accounts')
  return new Set(
    accounts
      .filter((account) => account.ownerId === user.id || !account.ownerId || (user.market && account.market === user.market))
      .map((account) => account.id),
  )
}
