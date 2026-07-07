import type { NextFunction, Response } from 'express'
import type { AuthRequest } from './auth.js'
import { isSuperAdmin } from './auth.js'

export type EntityAction = 'read' | 'create' | 'update' | 'replace' | 'delete'

const allWritableEntities = [
  'users',
  'accounts',
  'contacts',
  'campaigns',
  'leads',
  'opportunities',
  'orders',
  'contracts',
  'payments',
  'invoices',
  'products',
  'endUsers',
  'projectUpdates',
  'activities',
  'notifications',
  'documentTemplates',
  'retailMonthly',
  'dailyReports',
  'attendanceRecords',
  'auditLogs',
  'annualTargets',
]

const roleWritableEntities: Record<string, Set<string>> = {
  SuperAdmin: new Set(allWritableEntities),
  Admin: new Set(allWritableEntities),
  Sales: new Set(['accounts', 'contacts', 'leads', 'opportunities', 'activities', 'endUsers', 'dailyReports', 'attendanceRecords']),
  Marketing: new Set(['campaigns', 'leads', 'activities', 'retailMonthly', 'dailyReports', 'attendanceRecords']),
  Finance: new Set(['payments', 'invoices', 'dailyReports', 'attendanceRecords']),
  Legal: new Set(['contracts', 'documentTemplates', 'dailyReports', 'attendanceRecords']),
  Orders: new Set(['orders', 'projectUpdates', 'invoices', 'dailyReports', 'attendanceRecords']),
  'Supply Chain': new Set(['orders', 'projectUpdates', 'products', 'dailyReports', 'attendanceRecords']),
  Operations: new Set(['projectUpdates', 'activities', 'endUsers', 'dailyReports', 'attendanceRecords']),
  Executive: new Set([]),
}

export function canAccessEntity(user: AuthRequest['user'], entity: string, action: EntityAction): boolean {
  if (!user) return false
  if (action === 'read') return true
  if (isSuperAdmin(user)) return true
  if (action === 'delete') return false
  return roleWritableEntities[user.role]?.has(entity) ?? false
}

export function requireEntityPermission(entity: string, action: EntityAction) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!canAccessEntity(req.user, entity, action)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Role ${req.user?.role ?? 'unknown'} cannot ${action} ${entity}`,
      })
      return
    }
    next()
  }
}

export function getRolePermissions(role: string): string[] {
  const writableEntities = roleWritableEntities[role] ?? new Set<string>()
  const permissions = allWritableEntities.map((entity) => `${entity}:read`)
  for (const entity of writableEntities) {
    permissions.push(`${entity}:create`, `${entity}:update`)
  }
  if (role === 'SuperAdmin' || role === 'Admin') {
    permissions.push(...allWritableEntities.map((entity) => `${entity}:delete`))
    permissions.push('system:migration:export', 'system:migration:import')
  }
  return permissions
}
