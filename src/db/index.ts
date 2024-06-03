import { getRequestContext } from '@cloudflare/next-on-pages'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const db = () => {
  const env = getRequestContext().env
  return drizzle(env.DB, { schema })
}

export { schema }
