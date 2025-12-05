import { useState, useCallback, useRef } from 'react'
import { supabaseParts } from '@/lib/supabase-parts'

// Cache for consumable codes - persists across component re-renders
let cachedConsumableCodes: Set<string> | null = null

export function useConsumables() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchPromiseRef = useRef<Promise<Set<string>> | null>(null)

  const fetchConsumableCodes = useCallback(async (): Promise<Set<string>> => {
    // Return cached result if available
    if (cachedConsumableCodes) {
      return cachedConsumableCodes
    }

    // If already fetching, wait for that promise
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current
    }

    // If supabase parts client is not configured, return empty set
    if (!supabaseParts) {
      console.warn('Parts database not configured - consumable detection disabled')
      return new Set()
    }

    setLoading(true)
    setError(null)

    const fetchPromise = (async () => {
      try {
        const { data, error: fetchError } = await supabaseParts
          .from('parts')
          .select('our_part_number')
          .eq('consumable', true)

        if (fetchError) throw fetchError

        // Create set of uppercase item codes for case-insensitive matching
        const codes = new Set<string>(
          (data || [])
            .map((item) => item.our_part_number?.toUpperCase())
            .filter((code): code is string => Boolean(code))
        )

        // Cache the result
        cachedConsumableCodes = codes
        return codes
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch consumable codes'
        setError(message)
        console.error('Error fetching consumable codes:', message)
        return new Set<string>()
      } finally {
        setLoading(false)
        fetchPromiseRef.current = null
      }
    })()

    fetchPromiseRef.current = fetchPromise
    return fetchPromise
  }, [])

  const clearCache = useCallback(() => {
    cachedConsumableCodes = null
  }, [])

  return {
    fetchConsumableCodes,
    clearCache,
    loading,
    error,
  }
}
