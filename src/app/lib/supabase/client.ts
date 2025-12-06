import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Работает только на клиенте
  if (typeof window === 'undefined') {
    // На сервере возвращаем null или заглушку
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Если переменные окружения не заданы - возвращаем null
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are not set');
    return null;
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}