import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: AuthUser
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'angel-crm-dev-secret-change-me'

export interface AuthUser {
  id: string
  email: string
  role: string
  name: string
  department?: string
  market?: string
  permissions?: string[]
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const token = header.slice(7)
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function isSuperAdmin(user?: AuthRequest['user']): boolean {
  return user?.role === 'SuperAdmin' || user?.role === 'Admin'
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!isSuperAdmin(req.user)) {
    res.status(403).json({ error: 'Forbidden', message: 'Only super admins can perform this action' })
    return
  }
  next()
}
