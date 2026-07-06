import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { createStore } from '../data/jsonStore.js'
import { authMiddleware } from '../middleware/auth.js'

export function createGenericRouter<T extends { id: string }>(name: string): Router {
  const router = Router()
  const store = createStore<T>(name)

  router.get('/', authMiddleware, async (_req, res) => {
    const data = await store.getAll()
    res.json({ data })
  })

  router.get('/:id', authMiddleware, async (req, res) => {
    const item = await store.getById(req.params.id as string)
    if (!item) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({ data: item })
  })

  router.post('/', authMiddleware, async (req, res) => {
    const item = { ...req.body, id: req.body.id || cryptoRandomId(name) } as T
    const created = await store.create(item)
    res.status(201).json({ data: created })
  })

  router.patch('/:id', authMiddleware, async (req, res) => {
    const updated = await store.update(req.params.id as string, req.body)
    if (!updated) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({ data: updated })
  })

  router.put('/:id', authMiddleware, async (req, res) => {
    const id = req.params.id as string
    const item = { ...req.body, id } as T
    const updated = await store.replace(id, item)
    if (!updated) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({ data: updated })
  })

  router.delete('/:id', authMiddleware, async (req, res) => {
    const ok = await store.delete(req.params.id as string)
    if (!ok) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(204).send()
  })

  return router
}

function cryptoRandomId(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}
