import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { createStore } from '../data/jsonStore.js'
import { authMiddleware } from '../middleware/auth.js'
import { requireEntityPermission } from '../middleware/permission.js'
import { appendAuditLog } from '../services/auditService.js'
import { applyReadScope, canReadRecord } from '../services/scopeService.js'
import type { AuthRequest } from '../middleware/auth.js'

export function createGenericRouter<T extends { id: string }>(name: string): Router {
  const router = Router()
  const store = createStore<T>(name)

  router.use(authMiddleware)

  router.get('/', requireEntityPermission(name, 'read'), async (req: AuthRequest, res) => {
    const data = await store.getAll()
    const scopedData = await applyReadScope(name, data, req.user)
    res.json({ data: scopedData })
  })

  router.get('/:id', requireEntityPermission(name, 'read'), async (req: AuthRequest, res) => {
    const item = await store.getById(req.params.id as string)
    if (!item) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    if (!(await canReadRecord(name, item, req.user))) {
      res.status(403).json({ error: 'Forbidden', message: `You cannot read this ${name} record` })
      return
    }
    res.json({ data: item })
  })

  router.post('/', requireEntityPermission(name, 'create'), async (req: AuthRequest, res) => {
    const item = { ...req.body, id: req.body.id || cryptoRandomId(name) } as T
    const created = await store.create(item)
    await appendAuditLog(req, `${name}.create`, name, { id: created.id })
    res.status(201).json({ data: created })
  })

  router.patch('/:id', requireEntityPermission(name, 'update'), async (req: AuthRequest, res) => {
    const updated = await store.update(req.params.id as string, req.body)
    if (!updated) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    await appendAuditLog(req, `${name}.update`, name, { id: updated.id })
    res.json({ data: updated })
  })

  router.put('/:id', requireEntityPermission(name, 'replace'), async (req: AuthRequest, res) => {
    const id = req.params.id as string
    const item = { ...req.body, id } as T
    const updated = await store.replace(id, item)
    if (!updated) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    await appendAuditLog(req, `${name}.replace`, name, { id: updated.id })
    res.json({ data: updated })
  })

  router.delete('/:id', requireEntityPermission(name, 'delete'), async (req: AuthRequest, res) => {
    const id = req.params.id as string
    const ok = await store.delete(req.params.id as string)
    if (!ok) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    await appendAuditLog(req, `${name}.delete`, name, { id })
    res.status(204).send()
  })

  return router
}

function cryptoRandomId(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}
