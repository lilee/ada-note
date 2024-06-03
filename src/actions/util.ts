import { eq } from 'drizzle-orm'
import { auth } from '~/auth'
import { db, schema } from '~/db'

export const mustAuth = async () => {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('User not authenticated.')
  }
  return session.user
}

export const checkOwner = async (
  table: typeof schema.threads | typeof schema.topics,
  id: string
) => {
  const session = await mustAuth()
  const db_ = db()
  const objects = await db_.select().from(table).where(eq(table.id, id))
  if (objects && objects.length > 0 && objects[0].user_id !== session.userId) {
    throw new Error('Unauthorized')
  }
  return objects[0]
}

export const splitN = (str: string, sep: string, n: number) => {
  const parts: string[] = []
  let index = str.indexOf(sep)
  if (index === -1) {
    parts.push(str.trim())
    return parts
  }
  for (let i = 0; i < n; i++) {
    parts.push(str.slice(0, index).trim())
    str = str.slice(index + 1)
    index = str.indexOf(sep)
  }
  if (str) {
    parts.push(str.trim())
  }
  return parts
}

export const parseThreadContent = (text: string) => {
  const [firstLine, restContent = ''] = splitN(text, '\n', 1)

  const group_name = extractGroupName(firstLine)
  let thread_content = text
  if (group_name) {
    thread_content = restContent.trim()
  }
  return { group_name, thread_content }
}

const extractGroupName = (input: string) => {
  const regex = /^#(.*?)#$|^\[(.*?)\]$/
  const matches = input.match(regex)

  if (matches) {
    // matches[1] 是 ## 包围的字符串
    // matches[2] 是 [] 包围的字符串
    if (matches[1]) {
      return matches[1]
    } else if (matches[2]) {
      return matches[2]
    }
  }
  return undefined
}
