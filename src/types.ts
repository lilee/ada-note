import { SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core'
import { threads, topics } from './db/schema'

type ThreadSelect = typeof threads.$inferSelect
type TopicSelect = typeof topics.$inferSelect

export type ThreadData = ThreadSelect & { follows?: ThreadSelect[] }
export type TopicData = TopicSelect
export type TopicCreate = typeof topics.$inferInsert
export type TopicUpdate = SQLiteUpdateSetSource<typeof topics>
