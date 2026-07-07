import express from 'express'
import { readJson, writeJson } from '../data/jsonStore.js'
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import { appendAuditLog } from '../services/auditService.js'

const router = express.Router()

const entities = [
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
] as const

type EntityName = (typeof entities)[number]

interface MigrationPackage {
  type?: string
  version?: string
  exportedAt?: string
  exportedBy?: {
    id: string
    email: string
  }
  data?: Partial<Record<EntityName, unknown[]>>
}

router.use(authMiddleware)
router.use(requireSuperAdmin)

router.get('/export', async (req: AuthRequest, res) => {
  try {
    const data: Record<string, unknown[]> = {}
    for (const entity of entities) {
      data[entity] = await readJson(entity)
    }
    
    const exportData = {
      type: 'angel-crm-migration',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: req.user!.id,
        email: req.user!.email,
      },
      data,
    }

    await appendAuditLog(req, 'migration.export', 'data', {
      entities: entities.length,
    })
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=angel-crm-backup-${Date.now()}.json`)
    res.json(exportData)
  } catch (error) {
    res.status(500).json({ error: '导出失败', details: (error as Error).message })
  }
})

router.post('/import', async (req: AuthRequest, res) => {
  try {
    const payload = req.body as MigrationPackage
    const { data } = payload
    
    if (!data) {
      return res.status(400).json({ error: '请提供数据' })
    }

    const invalidEntities = Object.keys(data).filter((entity) => !entities.includes(entity as EntityName))
    if (invalidEntities.length > 0) {
      return res.status(400).json({ error: '迁移包包含未知数据表', invalidEntities })
    }

    const invalidArrays = Object.entries(data).filter(([, value]) => !Array.isArray(value)).map(([entity]) => entity)
    if (invalidArrays.length > 0) {
      return res.status(400).json({ error: '迁移包数据格式错误', invalidEntities: invalidArrays })
    }
    
    for (const entity of entities) {
      if (data[entity] !== undefined) {
        await writeJson(entity, data[entity] ?? [])
      }
    }

    await appendAuditLog(req, 'migration.import', 'data', {
      version: payload.version ?? 'unknown',
      exportedAt: payload.exportedAt ?? null,
      importedEntities: Object.keys(data),
    })
    
    res.json({ success: true, message: '数据导入成功' })
  } catch (error) {
    res.status(500).json({ error: '导入失败', details: (error as Error).message })
  }
})

export default router
