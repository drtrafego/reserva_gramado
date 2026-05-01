import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _instance: Db | undefined

function getInstance(): Db {
  if (!_instance) {
    const sql = neon(process.env.DATABASE_URL!)
    _instance = drizzle(sql, { schema })
  }
  return _instance
}

export const db: Db = new Proxy({} as Db, {
  get(_, prop) {
    return (getInstance() as Record<string | symbol, unknown>)[prop]
  },
})
