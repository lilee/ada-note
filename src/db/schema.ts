import { init } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { AnySQLiteColumn, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  reflect_prompts: text('reflect_prompts', { mode: 'json' })
    .$type<Record<string, string>>()
    .default({}),
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

export type ThreadGroupConfig = {
  [group_name: string]: { seq?: string }
}

export const topics = sqliteTable('topic', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  topic_name: text('topic_name').notNull(),
  builtin_topic_name: text('builtin_topic_name').unique(),
  topic_desc: text('topic_desc'),
  pin: integer('pin', { mode: 'boolean' }).notNull().default(false),
  group_name: text('group_name'),
  group_config: text('group_config', { mode: 'json' }).$type<ThreadGroupConfig>().default({}),
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
  thread_content_long: text('thread_content_long'),
  group_name: text('group_name'),
  pin_on_group: integer('pin_on_group').notNull().default(0),
  command: text('command'),
  color: text('color', { enum: ['none', 'highlight', 'task', 'task-done'] })
    .notNull()
    .default('none'),
  task_done_at: integer('task_done_at', {
    mode: 'timestamp',
  }),
  is_archived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
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

export const threadRefers = sqliteTable(
  'thread_refer',
  {
    thread_id: text('thread_id')
      .references(() => threads.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    lead_thread_id: text('lead_thread_id')
      .references(() => threads.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    refer_thread_id: text('refer_thread_id')
      .references(() => threads.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    user_id: text('user_id').references(() => users.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.thread_id, table.refer_thread_id] }),
  })
)

export const threadImages = sqliteTable(
  'thread_image',
  {
    thread_id: text('thread_id')
      .references(() => threads.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    image_id: text('image_id').notNull(),
    created_at: integer('created_at', {
      mode: 'timestamp',
    })
      .notNull()
      .$default(() => new Date()),
    user_id: text('user_id').references(() => users.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.thread_id, table.image_id] }),
  })
)

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
  refers: many(threadRefers, {
    relationName: 'refer',
  }),
  reverts: many(threadRefers, {
    relationName: 'revert',
  }),
  images: many(threadImages, {
    relationName: 'images',
  }),
}))

export const threadReferRelations = relations(threadRefers, ({ one }) => ({
  refer: one(threads, {
    fields: [threadRefers.thread_id],
    references: [threads.id],
    relationName: 'refer',
  }),
  revert: one(threads, {
    fields: [threadRefers.refer_thread_id],
    references: [threads.id],
    relationName: 'revert',
  }),
}))

export const threadImageRelations = relations(threadImages, ({ one }) => ({
  thread: one(threads, {
    fields: [threadImages.thread_id],
    references: [threads.id],
    relationName: 'images',
  }),
}))
