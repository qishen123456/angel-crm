import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { seedAll } from './data/seed.js'
import authRouter from './routes/auth.js'
import dataRouter from './routes/data.js'
import { createGenericRouter } from './routes/generic.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT ?? 3001)
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))

const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', service: 'angel-crm-backend', timestamp: new Date().toISOString() })
}

app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

app.use('/api/auth', authRouter)
app.use('/api/data', dataRouter)

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

entities.forEach((name) => {
  app.use(`/api/${name}`, createGenericRouter<{ id: string }>(name))
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

async function main() {
  await seedAll()
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ANGEL CRM backend listening on http://0.0.0.0:${PORT}`)
    console.log(`Data directory: ${process.env.DATA_DIR ?? './data'}`)
  })
}

main().catch((err) => {
  console.error('Failed to start backend:', err)
  process.exit(1)
})
