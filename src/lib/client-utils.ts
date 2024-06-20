import { useEffect, useState, useTransition } from 'react'

type UseFetchActionOptions = {
  cacheKey?: string
}

const globalRefreshes: Record<string, () => void> = {}

class LruCache<T> {
  private values: Map<string, T> = new Map<string, T>()
  private maxEntries: number = 30

  public get(key: string): T | undefined {
    const hasKey = this.values.has(key)
    let entry: T | undefined = undefined
    if (hasKey) {
      // peek the entry, re-insert for LRU strategy
      entry = this.values.get(key)!
      this.values.delete(key)
      this.values.set(key, entry)
    }

    return entry
  }

  public put(key: string, value: T) {
    if (this.values.size >= this.maxEntries) {
      // least-recently used cache eviction strategy
      const keyToDelete = this.values.keys().next().value
      this.values.delete(keyToDelete)
    }
    this.values.set(key, value)
  }
}
const cache = new LruCache<unknown>()

export const useFetchAction = <T>(
  action: () => Promise<T>,
  options: UseFetchActionOptions = {}
) => {
  const [loading, startTransition] = useTransition()
  const [data, setData] = useState<T>()
  const fetchData = () => {
    if (options.cacheKey) {
      const data = cache.get(options.cacheKey)
      if (data) {
        setData(data as T)
      }
    }
    startTransition(async () => {
      const data = await action()
      if (options.cacheKey) {
        cache.put(options.cacheKey, data)
      }
      setData(data)
    })
  }
  useEffect(() => {
    fetchData()
  }, [])

  const { cacheKey } = options
  if (cacheKey) {
    globalRefreshes[cacheKey] = fetchData
  }
  return { data, loading, refetch: fetchData }
}

export const refreshAction = (refreshKey: string) => {
  if (globalRefreshes[refreshKey]) {
    globalRefreshes[refreshKey]()
  }
}
