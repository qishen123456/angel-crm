import { Router } from 'express'
import { createStore } from '../data/jsonStore.js'
import { authMiddleware, signToken } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import type { User } from '../data/seedData.js'

const router = Router()
const userStore = createStore<User>('users')

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  const users = await userStore.getAll()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.status === 'active')
  if (!user || password !== 'demo2026') {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
  res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, market: user.market, avatar: user.avatar, status: user.status }, token })
})

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await userStore.getById(req.user!.id)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user })
})

export default router
