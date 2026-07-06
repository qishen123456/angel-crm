import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useAutoCreate(setOpen: (open: boolean) => void) {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setOpen(true)
    }
  }, [searchParams, setOpen])

  function clear() {
    if (searchParams.get('create') === '1') {
      const next = new URLSearchParams(searchParams)
      next.delete('create')
      setSearchParams(next, { replace: true })
    }
  }

  return clear
}
