'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';

export const dynamic = 'force-dynamic';
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