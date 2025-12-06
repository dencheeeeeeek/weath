'use client';
export const dynamic = 'force-dynamic'; // Отключает статическую генерацию
export const revalidate = 0; // Отключает кеширование
import { useEffect, useState } from "react";
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => {
  // ВАЖНО: Проверяем что мы на клиенте и есть переменные
  if (typeof window === 'undefined') {
    return null; // На сервере не создаем клиент
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase env vars missing');
    return null;
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Получаем избранные из профиля
        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_districts')
          .eq('id', user.id)
          .single();
        
        setFavorites(profile?.favorite_districts || []);
      }
      setLoading(false);
    };
    
    getUser();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (!user) return (
    <div className="container">
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
      </div>
      <h2>Войдите чтобы видеть избранное</h2>
      <Link href="/" className="nav-button">
        ← Назад к погоде
      </Link>
    </div>
  );

  return (
    <div className="container">
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
      </div>

      <h1>⭐ Избранные районы</h1>
      
      {favorites.length === 0 ? (
        <p>Нет избранных районов</p>
      ) : (
        <div className="districts-grid">
          {favorites.map(district => (
            <div key={district} className="district-card">
              <h3>{district}</h3>
              <p>Здесь будет погода для {district}</p>
            </div>
          ))}
        </div>
      )}

      <div className="navigation-section">
        <Link href="/" className="nav-button">
          ← Назад к погоде
        </Link>
      </div>
    </div>
  );
}