import { createClient } from '@supabase/supabase-js'

// Parts database connection (separate from main truck inventory database)
// This database contains the master parts list with consumable flags
const partsDbUrl = 'https://vmjngtmjdrasytgqsvxp.supabase.co'
const partsDbKey = import.meta.env.VITE_PARTS_SUPABASE_ANON_KEY

if (!partsDbKey) {
  console.warn('VITE_PARTS_SUPABASE_ANON_KEY is not set - consumable detection will be disabled')
}

export const supabaseParts = partsDbKey
  ? createClient(partsDbUrl, partsDbKey)
  : null
