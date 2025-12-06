import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Проверяем что мы на клиенте
  if (typeof window === 'undefined') {
    return null; // На сервере возвращаем null
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}