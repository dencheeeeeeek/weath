'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface DistrictWeather {
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

const weatherCodes: { [key: number]: string } = {
  0: "Ясно", 1: "Преимущ. ясно", 2: "Переменная облачность", 3: "Пасмурно",
  45: "Туман", 48: "Туман", 51: "Легкая морось", 53: "Морось", 55: "Сильная морось",
  56: "Ледяная морось", 57: "Сильная лед. морось", 61: "Небольшой дождь",
  63: "Дождь", 65: "Сильный дождь", 66: "Ледяной дождь", 67: "Сильный лед. дождь",
  71: "Небольшой снег", 73: "Снег", 75: "Сильный снег", 77: "Снежные зёрна",
  80: "Небольшой ливень", 81: "Ливень", 82: "Сильный ливень", 85: "Небольшой снегопад",
  86: "Снегопад", 95: "Гроза", 96: "Гроза с градом", 99: "Сильная гроза с градом"
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 минут

// Функции для работы с избранным
const getFavorites = (): string[] => {
  if (typeof window !== 'undefined') {
    const favorites = localStorage.getItem('favorite_districts');
    return favorites ? JSON.parse(favorites) : [];
  }
  return [];
};

const saveFavorites = (favorites: string[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('favorite_districts', JSON.stringify(favorites));
  }
};

const toggleFavorite = (district: string): string[] => {
  const favorites = getFavorites();
  let updatedFavorites: string[];
  
  if (favorites.includes(district)) {
    updatedFavorites = favorites.filter(f => f !== district);
  } else {
    updatedFavorites = [...favorites, district];
  }
  
  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

export default function DistrictsPage() {
  const [districtWeather, setDistrictWeather] = useState<DistrictWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Функция для обновления текущего времени
  const updateCurrentTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  // Загружаем избранные при монтировании
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Обновленная функция toggleFavorite
  const handleToggleFavorite = (district: string) => {
    const updatedFavorites = toggleFavorite(district);
    setFavorites(updatedFavorites);
    
    // Сообщаем другим вкладкам об изменении
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  };

  const getCachedRegionWeather = async (): Promise<DistrictWeather[]> => {
    const cacheKey = 'region_weather_cache';
    const now = Date.now();
    
    // Проверяем кеш
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < CACHE_DURATION) {
        setLastUpdate(new Date(timestamp).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        }));
        return data;
      }
    }
    
    // Делаем отдельные запросы для каждого района
    const weatherData: DistrictWeather[] = [];
    
    for (const [district, coords] of Object.entries(omskRegionDistricts)) {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=auto`
        );
        
        const data = await response.json();
        
        weatherData.push({
          name: district,
          temperature: data.current_weather.temperature,
          weathercode: data.current_weather.weathercode,
          windspeed: data.current_weather.windspeed,
          time: data.current_weather.time
        });
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Ошибка загрузки для ${district}:`, error);
      }
    }
    
    // Сохраняем в кеш
    localStorage.setItem(cacheKey, JSON.stringify({
      data: weatherData,
      timestamp: now
    }));
    
    setLastUpdate(new Date(now).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    return weatherData;
  };

  const refreshData = async () => {
    setLoading(true);
    localStorage.removeItem('region_weather_cache');
    const data = await getCachedRegionWeather();
    setDistrictWeather(data);
    setLoading(false);
    updateCurrentTime();
  };

  useEffect(() => {
    updateCurrentTime();
    const timeInterval = setInterval(updateCurrentTime, 1000);
    
    const loadData = async () => {
      const data = await getCachedRegionWeather();
      setDistrictWeather(data);
      setLoading(false);
    };
    
    loadData();
    
    const weatherInterval = setInterval(loadData, 30 * 60 * 1000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка погоды по районам...</div>
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
          <div className="current-time">
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {currentTime}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
              📅 Обновлено: {lastUpdate}
            </div>
          </div>
        </div>
        <div className="auth-section">
          <Link href="/" className="login-btn">
            ← Назад
          </Link>
        </div>
      </div>

      <div className="districts-header">
        <h1>Погода по районам Омской области</h1>
        <button className="refresh-btn" onClick={refreshData}>
          🔄 Обновить ({lastUpdate})
        </button>
      </div>

      <div className="districts-grid">
        {districtWeather.map((district) => (
          <div key={district.name} className="district-card">
            <button 
              className={`favorite-btn ${favorites.includes(district.name) ? 'favorited' : ''}`}
              onClick={() => handleToggleFavorite(district.name)}
              aria-label={favorites.includes(district.name) ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              {favorites.includes(district.name) ? '★' : '☆'}
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
    </div>
  );
}