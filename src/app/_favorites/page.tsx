'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Snowfall = dynamic(
  () => import('react-snowfall'),
  { ssr: false }
);
export const revalidate = 0;

export default function FavoritesPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container">
             <Snowfall
          color="#FFFFFF"
          speed={[0.5,2]}
          radius={[2,7]}
          snowflakeCount={150}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
          />
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
      </div>

      <h1>⭐ Избранные районы</h1>
      <p>Функция избранного будет доступна после входа в систему</p>
      
      <div className="navigation-section">
        <Link href="/" className="nav-button">
          ← Назад к погоде
        </Link>
      </div>
    </div>
  );
}