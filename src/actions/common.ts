'use server'

import { getRequestContext } from '@cloudflare/next-on-pages'

export const uploadImage = async (formData: FormData) => {
  const results: { key: string }[] = []
  const files = formData.getAll('images')
  for (const file of files as File[]) {
    const data = await file.arrayBuffer()
    // image hash as id
    const imageHash = await crypto.subtle.digest('SHA-1', data)
    const imageID = Buffer.from(imageHash).toString('hex')

    const { env } = getRequestContext()
    const headers = new Headers()
    headers.set('content-type', file.type)
    headers.set('content-length', `${file.size}`)
    const result = await env.IMAGE_BUCKET.put(imageID, data, {
      httpMetadata: headers,
    })
    if (result) {
      results.push({ key: result.key })
    }
  }
  return results
}
