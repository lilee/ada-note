import { init } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { AnySQLiteColumn, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const createId = init({ length: 10 })

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$default(() => createId()),
  email: text('email').unique().notNull(),
  username: text('username').unique(),
  nickname: text('nickname'),
  password: text('password').notNull(),
  role: text('role').$type<'admin' | 'user'>().default('user').notNull(),
  created_at: integer('created_at', {
    mode: 'timestamp',
  })
    .$default(() => new Date())
    .notNull(),
  updated_at: integer('updated_at', {
    mode: 'timestamp',
  })
    .$onUpdate(() => new Date())
    .notNull(),
})

export const topics = sqliteTable('topic', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  topic_name: text('topic_name').notNull(),
  builtin_topic_name: text('builtin_topic_name').unique(),
  topic_desc: text('topic_desc'),
  pin: integer('pin', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', {
    mode: 'timestamp',
  })
    .notNull()
    .$default(() => new Date()),
  updated_at: integer('updated_at', {
    mode: 'timestamp',
  })
    .$onUpdate(() => new Date())
    .notNull(),
  user_id: text('user_id').references(() => users.id),
})

export const threads = sqliteTable('thread', {
  id: text('id')
    .primaryKey()
    .$default(() => createId()),
  lead_thread_id: text('lead_thread_id').references((): AnySQLiteColumn => threads.id),
  topic_id: text('topic_id')
    .references(() => topics.id)
    .notNull(),
  thread_content: text('thread_content').notNull(),
  group_name: text('group_name'),
  is_task: integer('is_task', { mode: 'boolean' }).notNull().default(false),
  task_done_at: integer('task_done_at', {
    mode: 'timestamp',
  }),
  created_at: integer('created_at', {
    mode: 'timestamp',
  })
    .notNull()
    .$default(() => new Date()),
  updated_at: integer('updated_at', {
    mode: 'timestamp',
  })
    .$onUpdate(() => new Date())
    .notNull(),
  user_id: text('user_id').references(() => users.id),
})

export const userRelations = relations(users, ({ many }) => ({
  topics: many(topics),
  threads: many(threads),
}))

export const topicRelations = relations(topics, ({ one, many }) => ({
  user: one(users, {
    fields: [topics.user_id],
    references: [users.id],
  }),
  threads: many(threads),
}))

export const threadRelations = relations(threads, ({ one, many }) => ({
  topic: one(topics, {
    fields: [threads.topic_id],
    references: [topics.id],
  }),
  user: one(users, {
    fields: [threads.user_id],
    references: [users.id],
  }),
  lead: one(threads, {
    fields: [threads.lead_thread_id],
    references: [threads.id],
    relationName: 'follows',
  }),
  follows: many(threads, {
    relationName: 'follows',
  }),
}))
