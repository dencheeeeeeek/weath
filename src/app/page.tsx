'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';

interface WeatherData{
  current_weather:{
    temperature:number;
    weathercode: number;
    windspeed: number;
  };
  hourly:{
    relativehumidity_2m: number[];
    pressure_msl: number[];
    precipitation:number[];
    time:string[];
  };
  daily:{
    time:string[];
    temperature_2m_max:number[];
    temperature_2m_min:number[];
    weathercode:number[];
    precipitation_sum:number[];
  }
}

const weatherCodes: { [key: number]: string } = {
  0: "Ясно", 1: "Преимущественно ясно", 2: "Переменная облачность", 3: "Пасмурно",
  45: "Туман", 48: "Туман", 51: "Легкая морось", 53: "Морось", 55: "Сильная морось",
  56: "Ледяная морось", 57: "Сильная ледяная морось", 61: "Небольшой дождь",
  63: "Дождь", 65: "Сильный дождь", 66: "Ледяной дождь", 67: "Сильный ледяной дождь",
  71: "Небольшой снег", 73: "Снег", 75: "Сильный снег", 77: "Снежные зёрна",
  80: "Небольшой ливень", 81: "Ливень", 82: "Сильный ливень", 85: "Небольшой снегопад",
  86: "Снегопад", 95: "Гроза", 96: "Гроза с градом", 99: "Сильная гроза с градом"
};

const MiltiDayForecast = ({days, weather} : {days:number, weather:WeatherData}) => {
  const getDayName = (dateString:string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString('ru-RU', {weekday: "long"});
  };
  
  const formatDate = (dateString:string) => {
    const date = new Date(dateString + "T00:00:00")
    return `${date.getDate()}.${date.getMonth() + 1}`
  }
  
  return (
    <div className="multi-day-forecast">
      {weather.daily.time.slice(1, days + 1).map((date, index) => {
        const dataIndex = index + 1;
        return (
          <div key={date} className="forecast-day">
            <div className="day-name">{getDayName(date)}</div>
            <div className="day-date">{formatDate(date)}</div>
            <div className="day-temp">
              {Math.round(weather.daily.temperature_2m_max[dataIndex])}° / {Math.round(weather.daily.temperature_2m_min[dataIndex])}°
            </div>
            <div className="day-desc">
              {weatherCodes[weather.daily.weathercode[dataIndex]]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TomorrowWeather = ({ weather }: { weather: WeatherData }) => {
  const tomorrowIndex = 1;

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      weekday: tomorrow.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase(),
      date: tomorrow.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  const tomorrowDate = getTomorrowDate();

  return (
    <div className="main-content">
      <div className="left-column">
        <div className="weather-header">
          <div className="weather-title">ПОГОДА</div>
          <div className="location">О М С К</div>
        </div>

        <div className="date-section">
          <div className="day">{tomorrowDate.weekday}</div>
          <div className="date">{tomorrowDate.date}</div>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <span>Осадки за день:</span>
            <span>{weather.daily.precipitation_sum[tomorrowIndex].toFixed(1)} мм</span>
          </div>
          <div className="detail-item">
            <span>Давление:</span>
            <span>{Math.round(weather.hourly.pressure_msl[24])} гПа</span>
          </div>
          <div className="detail-item">
            <span>Ветер:</span>
            <span>{weather.current_weather.windspeed.toFixed(1)} м/с</span>
          </div>
          <div className="detail-item">
            <span>Макс. температура:</span>
            <span>{Math.round(weather.daily.temperature_2m_max[tomorrowIndex])}°C</span>
          </div>
          <div className="detail-item">
            <span>Мин. температура:</span>
            <span>{Math.round(weather.daily.temperature_2m_min[tomorrowIndex])}°C</span>
          </div>
        </div>

        <div className="navigation-section">
          <Link href="/garden" className="nav-button">
            🌱 Календарь дачника
          </Link>
        </div>
      </div>

      <div className="right-column">
        <div className="weather-widget temperature-widget">
          <div className="widget-content">
            <div className="temperature-value">
              {Math.round(weather.daily.temperature_2m_max[tomorrowIndex])}°C
            </div>
          </div>
        </div>
        <div className="weather-widget temperature-widget">
          <div className="widget-content">
            <div className="weather-condition">
              {weatherCodes[weather.daily.weathercode[tomorrowIndex]]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentWeather = ({ weather, currentDate }: { weather: WeatherData, currentDate: any }) => {
  return (
    <div className="main-content">
      <div className="left-column">
        <div className="weather-header">
          <div className="weather-title">ПОГОДА</div>
          <div className="location">О М С К</div>
        </div>

        <div className="date-section">
          <div className="day">{currentDate.weekday}</div>
          <div className="date">{currentDate.date}</div>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <span>Осадки сейчас:</span>
            <span>{weather.hourly.precipitation[0].toFixed(1)} мм</span>
          </div>
          <div className="detail-item">
            <span>Осадки за день:</span>
            <span>{weather.daily.precipitation_sum[0].toFixed(1)} мм</span>
          </div>
          <div className="detail-item">
            <span>Давление:</span>
            <span>{Math.round(weather.hourly.pressure_msl[0])} гПа</span>
          </div>
          <div className="detail-item">
            <span>Ветер:</span>
            <span>{weather.current_weather.windspeed.toFixed(1)} м/с</span>
          </div>
        </div>

        <div className="navigation-section">
          <Link href="/garden" className="nav-button">
            🌱 Календарь дачника
          </Link>
        </div>
      </div>

      <div className="right-column">
        <div className="weather-widget temperature-widget">
          <div className="widget-content">
            <div className="temperature-value">
              {Math.round(weather.current_weather.temperature)}°C
            </div>
          </div>
        </div>
        <div className="weather-widget temperature-widget">
          <div className="widget-content">
            <div className="weather-condition">
              {weatherCodes[weather.current_weather.weathercode]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [forecastPeriod, setForecastPeriod] = useState('today');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const updateTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('ru-RU', { 
      timeZone: 'Asia/Omsk',
      hour: '2-digit',
      minute: '2-digit'
    }));
  };

  const getWeather = async () => {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true&hourly=relativehumidity_2m,pressure_msl,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7"
      );
      const data = await response.json();
      setWeather(data);
    } catch(error) {
      console.log("error");
    }
  };

  useEffect(() => {
    getWeather();
    updateTime();
    const interval = setInterval(getWeather, 600000);
    const timeInterval = setInterval(updateTime, 1000);
    return() => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  if(!weather) return <div className="loading">Загрузка...</div>;

  const getCurrentDate = () => {
    const now = new Date();
    return {
      weekday: now.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase(),
      date: now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  const currentDate = getCurrentDate();

  return (
    <div className="container">
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
        <div className="time-section">
          <div className="current-time">{currentTime}</div>
        </div>
      </div>

      <div className="forecast-buttons">
        <button 
          className={forecastPeriod === 'today' ? 'active' : ''}
          onClick={() => setForecastPeriod('today')}
        >
          СЕЙЧАС
        </button>
        <button 
          className={forecastPeriod === 'tomorrow' ? 'active' : ''}
          onClick={() => setForecastPeriod('tomorrow')}
        >
          ЗАВТРА
        </button>
        <button 
          className={forecastPeriod === '3days' ? 'active' : ''}
          onClick={() => setForecastPeriod('3days')}
        >
          НА 3 ДНЯ
        </button>
        <button 
          className={forecastPeriod === '6days' ? 'active' : ''}
          onClick={() => setForecastPeriod('6days')}
        >
          НА 6 ДНЕЙ
        </button>
      </div>

      {forecastPeriod === 'today' && <CurrentWeather weather={weather} currentDate={currentDate} />}
      {forecastPeriod === 'tomorrow' && <TomorrowWeather weather={weather} />}
      {forecastPeriod === '3days' && <MiltiDayForecast days={3} weather={weather} />}
      {forecastPeriod === '6days' && <MiltiDayForecast days={6} weather={weather} />}
    </div>
  );
}