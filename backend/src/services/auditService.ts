import { randomUUID } from 'node:crypto'
import { readJson, writeJson } from '../data/jsonStore.js'
import type { AuthRequest } from '../middleware/auth.js'

export async function appendAuditLog(
  req: AuthRequest,
  action: string,
  target: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const auditLogs = await readJson<Record<string, unknown>>('auditLogs')
  auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    userId: req.user?.id ?? 'anonymous',
    action,
    target,
    metadata,
    ip: req.ip,
    createdAt: new Date().toISOString(),
  })
  await writeJson('auditLogs', auditLogs)
}
