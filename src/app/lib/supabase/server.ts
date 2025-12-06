import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Проверяем наличие переменных окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not set')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseKey)
    return null
  }
  
  try {
    return createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}