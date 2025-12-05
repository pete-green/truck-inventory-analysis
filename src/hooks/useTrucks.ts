import { useState, useCallback, useRef } from 'react'
import { supabaseParts } from '@/lib/supabase-parts'
import type { Truck } from '@/types'

// Cache for trucks - persists across component re-renders
let cachedTrucks: Truck[] | null = null

export function useTrucks() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchPromiseRef = useRef<Promise<Truck[]> | null>(null)

  const fetchTrucks = useCallback(async (): Promise<Truck[]> => {
    // Return cached result if available
    if (cachedTrucks) {
      return cachedTrucks
    }

    // If already fetching, wait for that promise
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current
    }

    // If supabase parts client is not configured, return empty array
    if (!supabaseParts) {
      console.warn('Parts database not configured - trucks list unavailable')
      return []
    }

    setLoading(true)
    setError(null)

    const fetchPromise = (async () => {
      try {
        const { data, error: fetchError } = await supabaseParts
          .from('trucks')
          .select('*')
          .eq('active', true)
          .order('truck_number', { ascending: true })

        if (fetchError) throw fetchError

        const trucks = (data || []) as Truck[]

        // Cache the result
        cachedTrucks = trucks
        return trucks
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch trucks'
        setError(message)
        console.error('Error fetching trucks:', message)
        return []
      } finally {
        setLoading(false)
        fetchPromiseRef.current = null
      }
    })()

    fetchPromiseRef.current = fetchPromise
    return fetchPromise
  }, [])

  const clearCache = useCallback(() => {
    cachedTrucks = null
  }, [])

  return {
    fetchTrucks,
    clearCache,
    loading,
    error,
  }
}
