import type { User } from '../mocks/crmData'

export const adminOnlyRoutes = new Set(['/app/import', '/app/invite', '/app/team', '/app/settings'])

const roleWritableEntities: Record<string, Set<string>> = {
  SuperAdmin: new Set(['*']),
  Admin: new Set(['*']),
  Sales: new Set(['accounts', 'contacts', 'leads', 'opportunities', 'activities', 'endUsers', 'dailyReports', 'attendanceRecords']),
  Marketing: new Set(['campaigns', 'leads', 'activities', 'retailMonthly', 'dailyReports', 'attendanceRecords']),
  Finance: new Set(['payments', 'invoices', 'dailyReports', 'attendanceRecords']),
  Legal: new Set(['contracts', 'documentTemplates', 'dailyReports', 'attendanceRecords']),
  Orders: new Set(['orders', 'projectUpdates', 'invoices', 'dailyReports', 'attendanceRecords']),
  'Supply Chain': new Set(['orders', 'projectUpdates', 'products', 'dailyReports', 'attendanceRecords']),
  Operations: new Set(['projectUpdates', 'activities', 'endUsers', 'dailyReports', 'attendanceRecords']),
  Executive: new Set([]),
}

export function isSuperAdmin(user?: Pick<User, 'role'> | null): boolean {
  return user?.role === 'SuperAdmin' || user?.role === 'Admin'
}

export function canAccessRoute(pathname: string, user?: Pick<User, 'role'> | null): boolean {
  const route = pathname.startsWith('/app/account') ? '/app/accounts' : pathname
  return !adminOnlyRoutes.has(route) || isSuperAdmin(user)
}

export function canCreateEntity(user: Pick<User, 'role' | 'permissions'> | null | undefined, entity: string): boolean {
  if (!user) return false
  if (user.permissions?.includes(`${entity}:create`)) return true
  const writableEntities = roleWritableEntities[user.role]
  return writableEntities?.has('*') || writableEntities?.has(entity) || false
}
