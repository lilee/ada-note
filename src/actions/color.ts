import { and, count, eq } from 'drizzle-orm'
import { db, schema } from '~/db'
import { ThreadColor } from '~/types'
import { mustAuth } from './util'

export const getColorThreads = async (color: ThreadColor) => {
  const user = await mustAuth()
  const db_ = db()

  const threads = await db_.query.threads.findMany({
    with: {
      follows: {
        limit: 10,
      },
    },
    where: (table, { and, eq, isNull }) =>
      and(
        isNull(table.lead_thread_id),
        eq(table.color, color),
        eq(table.is_archived, false),
        eq(table.user_id, user.userId)
      ),
    orderBy: (table, { desc }) => [desc(table.created_at)],
    limit: 50,
  })
  return threads
}

export const getTaskCount = async () => {
  const user = await mustAuth()
  const db_ = db()
  const numTasks = await db_
    .select({
      count: count(),
    })
    .from(schema.threads)
    .where(
      and(
        eq(schema.threads.color, 'task'),
        eq(schema.threads.is_archived, false),
        eq(schema.threads.user_id, user.userId)
      )
    )
}
