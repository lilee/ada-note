import { startTransition, useEffect, useState } from 'react'

type UseFetchActionOptions = {
  refreshKey?: string
}

const globalRefreshes: Record<string, () => void> = {}

export const useFetchAction = <T>(
  action: () => Promise<T>,
  options: UseFetchActionOptions = {}
) => {
  const [data, setData] = useState<T>()
  const fetchData = () => {
    startTransition(async () => {
      const data = await action()
      setData(data)
    })
  }
  useEffect(() => {
    fetchData()
  }, [])

  const { refreshKey } = options
  if (refreshKey) {
    globalRefreshes[refreshKey] = fetchData
  }
  return { data, refetch: fetchData }
}

export const refreshAction = (refreshKey: string) => {
  if (globalRefreshes[refreshKey]) {
    globalRefreshes[refreshKey]()
  }
}
