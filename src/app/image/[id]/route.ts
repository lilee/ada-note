import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'
export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const { id } = params
  const { env } = getRequestContext()
  const object = await env.IMAGE_BUCKET.get(id)

  if (object === null) {
    return new Response('Image Not Found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, {
    headers,
  })
}
