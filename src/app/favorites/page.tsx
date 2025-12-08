'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface FavoriteDistrict {
  name: string;
  temperature: number;
  weathercode: number;
  windspeed: number;
  time: string;
}

const Snowfall = dynamic(
  () => import('react-snowfall'),
  { ssr: false }
);

const weatherCodes: { [key: number]: string } = {
  0: "Ясно", 1: "Преимущественно ясно", 2: "Переменная облачность", 3: "Пасмурно",
  45: "Туман", 48: "Туман", 51: "Легкая морось", 53: "Морось", 55: "Сильная морось",
  56: "Ледяная морось", 57: "Сильная ледяная морось", 61: "Небольшой дождь",
  63: "Дождь", 65: "Сильный дождь", 66: "Ледяной дождь", 67: "Сильный ледяной дождь",
  71: "Небольшой снег", 73: "Снег", 75: "Сильный снег", 77: "Снежные зёрна",
  80: "Небольшой ливень", 81: "Ливень", 82: "Сильный ливень", 85: "Небольшой снегопад",
  86: "Снегопад", 95: "Гроза", 96: "Гроза с градом", 99: "Сильная гроза с градом"
};

// Координаты районов (должны совпадать с districts/page.tsx)
const omskRegionDistricts = {
  'Омск': { lat: 54.9924, lon: 73.3686 },
  'Тара': { lat: 56.7306, lon: 74.3641 },
  'Муромцево': { lat: 56.3744, lon: 75.2417 },
  'Называевск': { lat: 55.5686, lon: 71.3500 },
  'Москаленки': { lat: 54.9333, lon: 71.9333 },
  'Калачинск': { lat: 55.0500, lon: 74.5833 },
  'Исилькуль': { lat: 54.9167, lon: 71.2667 },
  'Тевриз': { lat: 57.5167, lon: 72.4000 },
  'Большие Уки': { lat: 56.9333, lon: 72.7667 },
  'Таврическое': { lat: 54.5833, lon: 73.6333 },
  'Черлак': { lat: 54.1500, lon: 74.8000 },
  'Полтавка': { lat: 54.3667, lon: 71.7667 },
  'Одесское': { lat: 54.2167, lon: 72.9667 },
  'Седельниково': { lat: 56.9500, lon: 75.3333 },
  'Колосовка': { lat: 56.4667, lon: 73.6167 }
};

export default function FavoritesPage() {
  const [favoriteDistricts, setFavoriteDistricts] = useState<FavoriteDistrict[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Функция для обновления времени
  const updateCurrentTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }));
  };

  // Получаем избранные районы из localStorage
  const getFavoriteDistrictNames = (): string[] => {
    if (typeof window !== 'undefined') {
      const favorites = localStorage.getItem('favorite_districts');
      return favorites ? JSON.parse(favorites) : [];
    }
    return [];
  };

  // Загружаем погоду для избранных районов
  const loadFavoriteWeather = async () => {
    const favoriteNames = getFavoriteDistrictNames();
    
    if (favoriteNames.length === 0) {
      setFavoriteDistricts([]);
      setLoading(false);
      return;
    }

    const weatherData: FavoriteDistrict[] = [];

    for (const districtName of favoriteNames) {
      const coords = omskRegionDistricts[districtName as keyof typeof omskRegionDistricts];
      if (!coords) continue;

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=auto`
        );
        
        const data = await response.json();
        
        weatherData.push({
          name: districtName,
          temperature: data.current_weather.temperature,
          weathercode: data.current_weather.weathercode,
          windspeed: data.current_weather.windspeed,
          time: data.current_weather.time
        });

        // Задержка чтобы не превысить лимиты API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Ошибка загрузки для ${districtName}:`, error);
      }
    }

    setFavoriteDistricts(weatherData);
    setLoading(false);
  };

  // Удаление из избранного
  const removeFromFavorites = (districtName: string) => {
    const favorites = getFavoriteDistrictNames();
    const updatedFavorites = favorites.filter(name => name !== districtName);
    
    localStorage.setItem('favorite_districts', JSON.stringify(updatedFavorites));
    loadFavoriteWeather(); // Перезагружаем список
  };

  useEffect(() => {
    updateCurrentTime();
    const timeInterval = setInterval(updateCurrentTime, 1000);
    
    loadFavoriteWeather();
    
    // Обновляем каждые 5 минут
    const weatherInterval = setInterval(loadFavoriteWeather, 5 * 60 * 1000);
    
    // Слушаем изменения в localStorage из других вкладок
    const handleStorageChange = () => {
      loadFavoriteWeather();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка избранных районов...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Snowfall
        color="#FFFFFF"
        speed={[0.5,2]}
        radius={[2,7]}
        snowflakeCount={100}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
      />
      
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
        <div className="time-section">
          <div className="current-time">{currentTime}</div>
        </div>
        <div className="auth-section">
          <Link href="/" className="login-btn">
            ← Назад
          </Link>
        </div>
      </div>

      <div className="districts-header">
        <h1>⭐ Избранные районы</h1>
        <button className="refresh-btn" onClick={loadFavoriteWeather}>
          🔄 Обновить
        </button>
      </div>

      {favoriteDistricts.length === 0 ? (
        <div className="empty-favorites">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'white',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            marginTop: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Пусто 😔</h2>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              Добавьте районы в избранное на странице "Районы"
            </p>
            <Link href="/districts" className="districts-btn">
              Перейти к районам →
            </Link>
          </div>
        </div>
      ) : (
        <div className="districts-grid">
          {favoriteDistricts.map((district) => (
            <div key={district.name} className="district-card">
              <button 
                className="favorite-btn favorited"
                onClick={() => removeFromFavorites(district.name)}
                aria-label="Удалить из избранного"
                title="Удалить из избранного"
              >
                ★
              </button>
              
              <h3 className="district-name">{district.name}</h3>
              
              <div className="district-weather">
                <div className="district-temp">
                  {Math.round(district.temperature)}°C
                </div>
                <div className="district-desc">
                  {weatherCodes[district.weathercode]}
                </div>
                <div className="district-wind">
                  💨 {district.windspeed.toFixed(1)} м/с
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}