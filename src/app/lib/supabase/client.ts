import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // На клиенте всегда должен быть доступен
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are not set')
    return null
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}