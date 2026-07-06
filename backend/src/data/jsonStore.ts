import { Mutex } from 'async-mutex'
import { existsSync, mkdirSync, promises as fs } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_DIR = process.env.DATA_DIR ?? join(__dirname, '../../data')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

const locks = new Map<string, Mutex>()

function getMutex(name: string): Mutex {
  if (!locks.has(name)) {
    locks.set(name, new Mutex())
  }
  return locks.get(name)!
}

function filePath(name: string): string {
  return join(DATA_DIR, `${name}.json`)
}

async function ensureFile(name: string, defaultValue: unknown[] = []): Promise<void> {
  const path = filePath(name)
  if (!existsSync(path)) {
    await fs.writeFile(path, JSON.stringify(defaultValue, null, 2) + '\n', 'utf-8')
  }
}

export async function readJson<T>(name: string): Promise<T[]> {
  await ensureFile(name)
  const raw = await fs.readFile(filePath(name), 'utf-8')
  try {
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeJson<T>(name: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath(name), JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

export async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const mutex = getMutex(name)
  return mutex.runExclusive(fn)
}

export function createStore<T extends { id: string }>(name: string) {
  return {
    async getAll(): Promise<T[]> {
      return readJson<T>(name)
    },

    async getById(id: string): Promise<T | undefined> {
      const all = await readJson<T>(name)
      return all.find((item) => item.id === id)
    },

    async create(item: T): Promise<T> {
      return withLock(name, async () => {
        const all = await readJson<T>(name)
        if (all.some((existing) => existing.id === item.id)) {
          throw new Error(`Duplicate id: ${item.id}`)
        }
        all.push(item)
        await writeJson(name, all)
        return item
      })
    },

    async update(id: string, patch: Partial<T>): Promise<T | undefined> {
      return withLock(name, async () => {
        const all = await readJson<T>(name)
        const index = all.findIndex((item) => item.id === id)
        if (index === -1) return undefined
        all[index] = { ...all[index], ...patch, id }
        await writeJson(name, all)
        return all[index]
      })
    },

    async delete(id: string): Promise<boolean> {
      return withLock(name, async () => {
        const all = await readJson<T>(name)
        const next = all.filter((item) => item.id !== id)
        if (next.length === all.length) return false
        await writeJson(name, next)
        return true
      })
    },

    async replace(id: string, item: T): Promise<T | undefined> {
      return withLock(name, async () => {
        const all = await readJson<T>(name)
        const index = all.findIndex((existing) => existing.id === id)
        if (index === -1) return undefined
        all[index] = item
        await writeJson(name, all)
        return item
      })
    },

    async seed(items: T[]): Promise<void> {
      return withLock(name, async () => {
        const path = filePath(name)
        if (existsSync(path)) return
        await writeJson(name, items)
      })
    },
  }
}
