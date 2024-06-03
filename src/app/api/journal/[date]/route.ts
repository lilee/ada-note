import { db } from '~/db'
import { auth } from '~/app/api/auth'

export const runtime = 'edge'

type APIParams = { date: string }

export const GET = async (req: Request, { params }: { params: APIParams }) => {
  const user = await auth(req)
  const db_ = db()
  const { date } = params
  const builtin_topic_name = `journal_${date}`
  const topic = await db_.query.topics.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.builtin_topic_name, builtin_topic_name), eq(table.user_id, user.userId)),
  })
  if (!topic) {
    return Response.json([])
  }

  const threads = await db_.query.threads.findMany({
    with: {
      follows: {
        limit: 10,
      },
    },
    where: (table, { and, eq, isNull }) =>
      and(
        isNull(table.lead_thread_id),
        eq(table.topic_id, topic.id),
        eq(table.user_id, user.userId)
      ),
    orderBy: (table, { desc }) => [desc(table.created_at)],
    limit: 50,
  })
  return Response.json(threads)
}
