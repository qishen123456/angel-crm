import express from 'express'
import { readJson, writeJson } from '../data/jsonStore.js'

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
  'products',
  'endUsers',
  'projectUpdates',
  'activities',
  'notifications',
  'documentTemplates',
  'retailMonthly',
  'dailyReports',
  'auditLogs',
  'annualTargets',
] as const

router.get('/export', async (_req, res) => {
  try {
    const data: Record<string, unknown[]> = {}
    for (const entity of entities) {
      data[entity] = await readJson(entity)
    }
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data,
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=angel-crm-backup-${Date.now()}.json`)
    res.json(exportData)
  } catch (error) {
    res.status(500).json({ error: '导出失败', details: (error as Error).message })
  }
})

router.post('/import', async (req, res) => {
  try {
    const { data } = req.body as { data?: Record<string, unknown[]> }
    
    if (!data) {
      return res.status(400).json({ error: '请提供数据' })
    }
    
    for (const entity of entities) {
      if (data[entity] !== undefined) {
        await writeJson(entity, Array.isArray(data[entity]) ? data[entity] : [])
      }
    }
    
    res.json({ success: true, message: '数据导入成功' })
  } catch (error) {
    res.status(500).json({ error: '导入失败', details: (error as Error).message })
  }
})

export default router
