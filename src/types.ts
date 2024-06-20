import { SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core'
import * as schema from './db/schema'

type ThreadSelect = typeof schema.threads.$inferSelect
type TopicSelect = typeof schema.topics.$inferSelect
type ThreadReferSelect = typeof schema.threadRefers.$inferSelect

export type ThreadData = ThreadSelect & {
  follows?: ThreadSelect[]
  refers?: ThreadReferSelect[]
  reverts?: ThreadReferSelect[]
}
export type ThreadUpdate = SQLiteUpdateSetSource<typeof schema.threads>
export type ThreadColor = 'none' | 'highlight' | 'task'
export type ThreadReferData = ThreadReferSelect

export type TopicData = TopicSelect
export type TopicCreate = typeof schema.topics.$inferInsert
export type TopicUpdate = SQLiteUpdateSetSource<typeof schema.topics>

export type ThreadGroup = {
  group_name: string
  seq?: string
  children?: string[]
}
