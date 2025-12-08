'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import dynamic from 'next/dynamic';

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
    uv_index:number[];
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


const getUvlLevel=(uvIndex: number):string=>{
  if(uvIndex<=2) return 'Низкий'
  if(uvIndex<=5) return 'Умеренный'
  if(uvIndex<=7) return 'Высокий'
  if(uvIndex<=10) return 'Очень высокий'
  return 'Экстримальный'
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

const getClothingAdvice = (weather: WeatherData, isTomorrow: boolean = false) => {
  const temp = isTomorrow ? weather.daily.temperature_2m_max[1] : weather.current_weather.temperature;
  const weatherCode = isTomorrow ? weather.daily.weathercode[1] : weather.current_weather.weathercode;
  const precipitation = isTomorrow ? weather.daily.precipitation_sum[1] : weather.daily.precipitation_sum[0];
  
  const advice = [];

  if (temp < -20) advice.push("❄️ Тёплая зимняя одежда, термобельё, шапка, перчатки");
  else if (temp < -10) advice.push("🧥 Зимняя куртка, тёплая обувь, шапка, шарф");
  else if (temp < 0) advice.push("🧥 Тёплая куртка, головной убор, перчатки");
  else if (temp < 10) advice.push("👔 Куртка, демисезонная обувь");
  else if (temp > 25) advice.push("👕 Лёгкая одежда, головной убор от солнца");

  if (precipitation > 5) advice.push("🌧️ Непромокаемая обувь, зонт");
  if (precipitation > 10) advice.push("🥾 Высокая непромокаемая обувь");
  
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    advice.push("⛄ Тёплая непромокаемая одежда, зимняя обувь");
  }
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    advice.push("🌂 Дождевик или зонт, непромокаемая обувь");
  }
  if (weatherCode === 3) advice.push("☁️ Лёгкая куртка - может быть прохладно");
  if ([0, 1].includes(weatherCode)) advice.push("😎 Солнцезащитные очки в солнечный день");

  return advice.length > 0 ? advice : ["👔 Стандартная одежда по сезону"];
};

interface FishingForecast {
  biteProbability: number;
  mood: string;
  advice: string;
  bait: string;
  bestTime: string;
  seasonFactor: number;
  pressureChange: number;
  isGood: boolean;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
  humidity:number;
  factors: {
    temperature: { score: number, desc: string };
    pressure: { score: number, desc: string };
    wind: { score: number, desc: string };
    season: { score: number, desc: string };
    precipitation: { score: number, desc: string };
    timeOfDay: { score: number, desc: string };
    humidity:{score:number, desc:string};
  };
}

const getFishingAdvice = (weather: WeatherData, isTomorrow: boolean = false): FishingForecast => {
  const currentTemp = weather.current_weather.temperature;
  const temp = isTomorrow ? weather.daily.temperature_2m_max[1] : currentTemp;
  const weatherCode = isTomorrow ? weather.daily.weathercode[1] : weather.current_weather.weathercode;
  const wind = weather.current_weather.windspeed;
  const currentPressure = weather.hourly.pressure_msl[0];
  const tomorrowPressure = weather.hourly.pressure_msl[24];
  const pressureChange = tomorrowPressure - currentPressure;
  const precipitation = isTomorrow ? weather.daily.precipitation_sum[1] : weather.hourly.precipitation[0];
  const currentHumidity=weather.hourly.relativehumidity_2m[0]
  const tomorrowHumidity=weather.hourly.relativehumidity_2m[24]
  const humidity=isTomorrow? tomorrowHumidity:currentHumidity
  
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  
  // СЕЗОННАЯ КОРРЕКЦИЯ
  const getSeasonFactor = (): { factor: number, desc: string } => {
    if (month >= 11 || month <= 1) {
      return { factor: 0.6, desc: 'Зимний сезон' };
    }
    if (month >= 2 && month <= 4) {
      return { factor: 1.2, desc: 'Весенний сезон' };
    }
    if (month >= 5 && month <= 7) {
      return { factor: 0.9, desc: 'Летний сезон' };
    }
    return { factor: 1.1, desc: 'Осенний сезон' };
  };

  // Добавь эту функцию в getFishingAdvice или отдельно:
const getHumidityScore = (humidity: number): { score: number, desc: string } => {
  // Идеальная влажность для рыбалки: 60-75%
  if (humidity >= 60 && humidity <= 75) {
    return { score: 1.0, desc: 'Идеальная влажность' };
  }
  
  if (humidity >= 50 && humidity <= 85) {
    return { score: 0.8, desc: 'Хорошая влажность' };
  }
  
  if (humidity >= 40 && humidity <= 90) {
    return { score: 0.6, desc: 'Нормальная влажность' };
  }
  
  if (humidity < 30) {
    return { score: 0.4, desc: 'Слишком сухо' };
  }
  
  if (humidity > 90) {
    return { score: 0.3, desc: 'Очень высокая влажность' };
  }
  
  return { score: 0.5, desc: 'Средняя влажность' };
};
  
  // ОЦЕНКА ТЕМПЕРАТУРЫ
  const getTemperatureScore = (): { score: number, desc: string } => {
    if (temp < -20) return { score: 0.1, desc: 'Экстремальный холод' };
    if (temp < -10) return { score: 0.3, desc: 'Сильный мороз' };
    if (temp < 0) return { score: 0.5, desc: 'Мороз' };
    if (temp < 5) return { score: 0.7, desc: 'Прохладно' };
    if (temp < 15) return { score: 1.0, desc: 'Идеальная температура' };
    if (temp < 22) return { score: 0.8, desc: 'Тепло' };
    if (temp < 28) return { score: 0.5, desc: 'Жарко' };
    return { score: 0.2, desc: 'Экстремальная жара' };
  };
  // ОЦЕНКА ДАВЛЕНИЯ
  const getPressureScore = (): { score: number, desc: string } => {
    const absPressure = currentPressure;
    let pressureScore = 0.5;
    
    if (absPressure >= 1013 && absPressure <= 1020) pressureScore = 1.0;
    else if (absPressure >= 1005 && absPressure < 1013) pressureScore = 0.8;
    else if (absPressure > 1020 && absPressure <= 1030) pressureScore = 0.7;
    else if (absPressure < 1005) pressureScore = 0.4;
    else if (absPressure > 1030) pressureScore = 0.3;
    
    if (Math.abs(pressureChange) < 1) pressureScore *= 1.1;
    else if (pressureChange > 0 && pressureChange < 3) pressureScore *= 1.2;
    else if (pressureChange > 3) pressureScore *= 0.7;
    else if (pressureChange < -3) pressureScore *= 0.5;
    
    let desc = '';
    if (pressureChange > 3) desc = 'Давление резко растёт';
    else if (pressureChange > 0) desc = 'Давление растёт';
    else if (pressureChange < -3) desc = 'Давление резко падает';
    else if (pressureChange < 0) desc = 'Давление падает';
    else desc = 'Давление стабильное';
    
    return { score: Math.min(pressureScore, 1.0), desc };
  };
  
  // ОЦЕНКА ВЕТРА
  const getWindScore = (): { score: number, desc: string } => {
    if (wind < 1) return { score: 0.6, desc: 'Штиль' };
    if (wind < 3) return { score: 1.0, desc: 'Лёгкий ветер' };
    if (wind < 6) return { score: 0.8, desc: 'Умеренный ветер' };
    if (wind < 10) return { score: 0.5, desc: 'Сильный ветер' };
    return { score: 0.2, desc: 'Шторм' };
  };
  
  // ОЦЕНКА ОСАДКОВ
  const getPrecipitationScore = (): { score: number, desc: string } => {
    if (precipitation === 0) return { score: 0.9, desc: 'Без осадков' };
    if (precipitation < 2) return { score: 1.0, desc: 'Лёгкие осадки' };
    if (precipitation < 5) return { score: 0.7, desc: 'Умеренные осадки' };
    if (precipitation < 10) return { score: 0.4, desc: 'Сильные осадки' };
    return { score: 0.1, desc: 'Ливень' };
  };
  
  // ВРЕМЯ СУТОК
  const getTimeOfDayScore = (): { score: number, desc: string } => {
    if (hour >= 4 && hour < 8) return { score: 1.2, desc: 'Рассвет' };
    if (hour >= 8 && hour < 12) return { score: 0.8, desc: 'Утро' };
    if (hour >= 12 && hour < 16) return { score: 0.6, desc: 'День' };
    if (hour >= 16 && hour < 20) return { score: 1.0, desc: 'Вечер' };
    if (hour >= 20 && hour < 22) return { score: 0.7, desc: 'Поздний вечер' };
    return { score: 0.3, desc: 'Ночь' };
  };
  // РАСЧЁТ БАЛЛОВ
  const tempScore = getTemperatureScore();
  const pressureScore = getPressureScore();
  const windScore = getWindScore();
  const precipScore = getPrecipitationScore();
  const timeScore = getTimeOfDayScore();
  const season = getSeasonFactor();
  const humidityScore=getHumidityScore(humidity);

  const baseScore = (
    tempScore.score * 0.25 +
    pressureScore.score * 0.25 +
    windScore.score * 0.15 +
    precipScore.score * 0.15 +
    timeScore.score * 0.2 +
    humidityScore.score *0.15
  );
  
  const finalScore = Math.min(baseScore * season.factor, 1.0);
  const biteProbability = Math.round(finalScore * 100);
  
  // РЕЙТИНГ
  let rating: 'poor' | 'fair' | 'good' | 'excellent';
  let mood = '';
  
  if (biteProbability >= 80) {
    rating = 'excellent';
    mood = '🎯 Идеальный день! Рыба активно питается';
  } else if (biteProbability >= 60) {
    rating = 'good';
    mood = '👍 Хорошие условия, рыба в настроении';
  } else if (biteProbability >= 40) {
    rating = 'fair';
    mood = '🤔 Средний клёв, нужна правильная тактика';
  } else {
    rating = 'poor';
    mood = '😴 Слабый клёв, рыба пассивна';
  }
  
  // СОВЕТЫ
  const getBaitAdvice = () => {
    const baits = [];
    if (temp < 5) baits.push('Мормышка с мотылём', 'Опарыш', 'Мотыль');
    else if (temp < 15) baits.push('Черви', 'Опарыш', 'Кукуруза');
    else baits.push('Кукуруза', 'Горох', 'Тесто');
    return baits.slice(0, 3).join(', ');
  };
  
  const getBestTime = () => {
    if (timeScore.score >= 1.0) return 'Сейчас идеальное время!';
    if (hour < 12) return 'Лучшее время: 16:00-20:00';
    return 'Лучшее время: завтра 4:00-8:00';
  };
  
  const getGeneralAdvice = () => {
    const advice = [];
    if (windScore.score < 0.5) advice.push('Ищите затишные места');
    if (tempScore.score < 0.5) advice.push('Используйте тонкие снасти');
    if (pressureScore.score < 0.5) advice.push('Рыбачьте на глубине');
    return advice.length > 0 ? advice.join('. ') : 'Стандартная тактика';
  };
  
  return {
    biteProbability,
    mood,
    advice: getGeneralAdvice(),
    bait: getBaitAdvice(),
    bestTime: getBestTime(),
    seasonFactor: season.factor,
    pressureChange: parseFloat(pressureChange.toFixed(1)),
    humidity: Math.round(humidity),
    isGood: biteProbability >= 60,
    rating,
    factors: {
      temperature: tempScore,
      pressure: pressureScore,
      wind: windScore,
      season: { score: season.factor, desc: season.desc },
      precipitation: precipScore,
      timeOfDay: timeScore,
      humidity: humidityScore
    }
  };
};

const MultiDayForecast = ({days, weather, onDayClick} : {days:number, weather:WeatherData, onDayClick: (dayIndex: number) => void}) => {
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
          <div key={date} className="forecast-day" onClick={() => onDayClick(dataIndex)}>
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

const TomorrowWeather=({ weather, onDayClick }: { weather: WeatherData, onDayClick?: (dayIndex: number) => void }) => {
  const tomorrowIndex = 1;
  const fishingAdvice = getFishingAdvice(weather, true);
  const tomorrowHumidity=weather.hourly.relativehumidity_2m[24]

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
    <div className="main-content" onClick={() => onDayClick && onDayClick(1)}>
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
            <span>{convertPressure(weather.hourly.pressure_msl[24])} мм рт. ст.</span>
          </div>
        <div className="detail-item">
          <span>Влажность:</span>
          <span>{Math.round(weather.hourly.relativehumidity_2m[24])}%</span>
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
          <div className="detail-item">
          <span>Влажность</span>
          <span>{Math.round(tomorrowHumidity)}%</span>
          </div>
          <div className="detail-item">
            <span>УФИ</span>
            <span>{Math.round(weather.hourly.uv_index[1])}</span>
            <span>{getUvlLevel(weather.hourly.uv_index[1])}</span>
          </div>

          <div className="clothing-advice-section">
            <div className="section-title">👕 Рекомендации по одежде</div>
            {getClothingAdvice(weather, true).map((item, index) => (
              <div key={index} className="advice-item">{item}</div>
            ))}
          </div>
        </div>

        <div className="navigation-section">
          <Link href="/garden" className="nav-button gradient-text-btn">
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
  <div className="fishing-advice-section">
  <div className="section-title">🎣 Прогноз клёва</div>
  
  <div className={`fishing-rating ${fishingAdvice.rating}`}>
    <div className="rating-header">
      <span className="rating-title">Вероятность клёва:</span>
      <span className="rating-value">{fishingAdvice.biteProbability}%</span>
    </div>
    <div className="rating-bar">
      <div 
        className="rating-fill" 
        style={{ width: `${fishingAdvice.biteProbability}%` }}
      ></div>
    </div>
  </div>
  
  <div className="fishing-mood">
    {fishingAdvice.mood}
  </div>
  
  <div className="fishing-details">
    <div className="fishing-factor">
      <span>🌡️ Температура:</span>
      <span>{fishingAdvice.factors.temperature.desc}</span>
    </div>
    <div className="fishing-factor">
      <span>📊 Давление:</span>
      <span>{fishingAdvice.factors.pressure.desc}</span>
    </div>
    <div className="fishing-factor">
      <span>🌪️ Ветер:</span>
      <span>{fishingAdvice.factors.wind.desc}</span>
    </div>
      <div className="fishing-factor">
    <span>💧 Влажность:</span>
    <span>
      {fishingAdvice.humidity}% - {fishingAdvice.factors.humidity.desc}
    </span>
  </div>
    <div className="fishing-factor">
      <span>📅 Сезон:</span>
      <span>{fishingAdvice.factors.season.desc}</span>
    </div>
  </div>
  
  <div className="fishing-tips">
    <div className="fishing-tip">
      <span>💡 Совет:</span> {fishingAdvice.advice}
    </div>
    <div className="fishing-tip">
      <span>🪝 Приманки:</span> {fishingAdvice.bait}
    </div>
    <div className="fishing-tip">
      <span>⏰ Время:</span> {fishingAdvice.bestTime}
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

const CurrentWeather = ({ weather, currentDate }: { weather: WeatherData, currentDate: any }) => {
  const fishingAdvice = getFishingAdvice(weather, false);
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
            <span>{convertPressure(weather.hourly.pressure_msl[0])} мм. рт. ст.</span>
          </div>
          <div className="detail-item">
            <span>Влажность:</span>
            <span>{fishingAdvice.humidity}% - {fishingAdvice.factors.humidity.desc}</span>
          </div>
          <div className="detail-item">
            <span>Ветер:</span>
            <span>{weather.current_weather.windspeed.toFixed(1)} м/с</span>
          </div>
          <div className="detail-item">
            <span>УФИ</span>
            <span>{Math.round(weather.hourly.uv_index[0])}</span>
            <span>{getUvlLevel(weather.hourly.uv_index[0])}</span>
          </div>

          <div className="clothing-advice-section">
            <div className="section-title">👕 Рекомендации по одежде</div>
            {getClothingAdvice(weather, false).map((item, index) => (
              <div key={index} className="advice-item">{item}</div>
            ))}
          </div>
        </div>

        <div className="navigation-section">
          <Link href="/garden" className="nav-button gradient-text-btn">
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
        <div className="fishing-advice-section">
          <div className="section-title">🎣 Рыбалка</div>
<div className={`fishing-mood ${fishingAdvice.isGood ? 'good' : 'normal'}`}>
  {fishingAdvice.mood}
</div>

          <div className="fishing-tips">
            <div className="fishing-tip">💡 {fishingAdvice.advice}</div>
            <div className="fishing-tip">🪝 {fishingAdvice.bait}</div>
          </div>
          <div className="fishing-pressure">
  📊 Давление меняется на {convertPressure(fishingAdvice.pressureChange)} мм рт. ст.
  {Math.abs(fishingAdvice.pressureChange * 0.750062) > 3 && " ⚠️"}
</div>
        </div>
      </div>
    </div>
  );
};
// Мобильный виджет температуры
const MobileTemperatureWidget = ({ weather }: { weather: WeatherData | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather) return null;

  const getWeatherIcon = (weatherCode: number) => {
    if ([0, 1].includes(weatherCode)) return '☀️';
    if ([2, 3].includes(weatherCode)) return '⛅';
    if ([45, 48].includes(weatherCode)) return '🌫️';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
    if ([95, 96, 99].includes(weatherCode)) return '⛈️';
    return '🌤️';
  };

  return (
    <div 
      className={`mobile-temperature-widget ${isExpanded ? 'mobile-widget-expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
      onTouchStart={() => setIsExpanded(true)}
      onTouchEnd={() => setTimeout(() => setIsExpanded(false), 3000)}
    >
      <div className="mobile-temp-value">
        {Math.round(weather.current_weather.temperature)}°C
      </div>
      <div className="mobile-weather-icon">
        {getWeatherIcon(weather.current_weather.weathercode)}
      </div>
      
      {isExpanded && (
        <div className="mobile-widget-details">
          <div>{weatherCodes[weather.current_weather.weathercode]}</div>
          <div>Ветер: {weather.current_weather.windspeed.toFixed(1)} м/с</div>
          <div>Осадки: {weather.hourly.precipitation[0].toFixed(1)} мм</div>
        </div>
      )}
    </div>
  );
};
const convertPressure = (hPa: number): number => {
  // 1 гПа = 0.750062 мм рт.ст.
  return Math.round(hPa * 0.750062);
};

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [forecastPeriod, setForecastPeriod] = useState('today');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  // Инициализация Supabase клиента
  const supabase = createClient();

  // Автоматически проверяем пользователя каждые 3 секунды
useEffect(() => {
  const checkUser = async () => {
    if (supabase) {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Ошибка получения пользователя:', error);
        return;
      }
      
      if (currentUser) {
        // Проверяем, не установлен ли уже этот пользователь
        if (!user || user.id !== currentUser.id) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Пользователь'
          });
        }
      } else {
        // Если пользователя нет, сбрасываем состояние
        if (user) {
          setUser(null);
        }
      }
    }
  };
  
  checkUser();
  
  // Подписываемся на изменения авторизации
  if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Пользователь'
        });
      } else {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }
}, [supabase]);

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
        "https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true&hourly=relativehumidity_2m,pressure_msl,precipitation,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&forecast_days=7"
      );
      const data = await response.json();
      setWeather(data);
    } catch(error) {
      console.log("error");
    }
  };

const handleAuth = async (isLogin: boolean) => {
  if (!supabase) {
    setAuthError('Система авторизации временно недоступна');
    return;
  }

  setLoading(true);
  setAuthError('');
  setAuthSuccess('');

  if (!isLogin && password !== confirmPassword) {
    setAuthError('Пароли не совпадают');
    setLoading(false);
    return;
  }

  try {
    if (isLogin) {
      // ЛОГИН
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Сразу обновляем пользователя
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || email.split('@')[0] || 'Пользователь'
        });
      }
      
      setAuthSuccess('Вход успешен!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1500);
    } else {
      // РЕГИСТРАЦИЯ
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (newUser) {
        // Сразу обновляем пользователя
        setUser({
          id: newUser.id,
          email: newUser.email,
          username: username || newUser.email?.split('@')[0] || 'Пользователь'
        });
        
        setAuthSuccess('Регистрация успешна! Проверьте указанный E-mail для подтверждения!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 2000);
      }
    }
  } catch (error: any) {
    setAuthError(error.message || 'Произошла ошибка');
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
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
          <Snowfall
          color="#FFFFFF"
          speed={[0.5,2]}
          radius={[2,7]}
          snowflakeCount={100}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
          />
        </div>

        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <span className="username">👤 {user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <button 
              className="login-btn" 
              onClick={() => setIsAuthModalOpen(true)}
            >
              Войти
            </button>
          )}
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
        <Link href="/districts" className="districts-btn">
          🗺️ Районы
        </Link>
        <Link href="/favorites" className="districts-btn">
          ⭐ Избранное
        </Link>
      </div>

      {isAuthModalOpen && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <div className="modal-header">
              <h2>Вход в аккаунт</h2>
              <button className="close-btn" onClick={() => setIsAuthModalOpen(false)}>×</button>
            </div>
            
            <div className="auth-tabs">
              <button 
                className={activeTab === 'login' ? 'tab-active' : ''}
                onClick={() => setActiveTab('login')}
              >
                Вход
              </button>
              <button 
                className={activeTab === 'register' ? 'tab-active' : ''}
                onClick={() => setActiveTab('register')}
              >
                Регистрация
              </button>
            </div>
            
            {activeTab === 'login' ? (
              <div className="auth-form">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {authError && <div className="auth-error">{authError}</div>}
                {authSuccess && <div className="auth-success">{authSuccess}</div>}
                <button 
                  className="submit-btn" 
                  onClick={() => handleAuth(true)}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Войти'}
                </button>
              </div>
            ) : (
              <div className="auth-form">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Имя пользователя" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Повторите пароль" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {authError && <div className="auth-error">{authError}</div>}
                {authSuccess && <div className="auth-success">{authSuccess}</div>}
                <button 
                  className="submit-btn" 
                  onClick={() => handleAuth(false)}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDay !== null && weather && (
        <div className="modal-overlay">
          <div className="forecast-modal">
            <div className="modal-header">
              <h2>Прогноз на {new Date(weather.daily.time[selectedDay]).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
              <button className="close-btn" onClick={() => setSelectedDay(null)}>×</button>
            </div>
            
            <div className="forecast-details">
              <div className="detail-item">
                <span>Макс. температура:</span>
                <span>{Math.round(weather.daily.temperature_2m_max[selectedDay])}°C</span>
              </div>
              <div className="detail-item">
                <span>Мин. температура:</span>
                <span>{Math.round(weather.daily.temperature_2m_min[selectedDay])}°C</span>
              </div>
              <div className="detail-item">
                <span>Осадки:</span>
                <span>{weather.daily.precipitation_sum[selectedDay].toFixed(1)} мм</span>
              </div>
              <div className="detail-item">
                <span>Влажность:</span>
                <span>{weather.hourly.relativehumidity_2m[0]}</span>
              </div>
              <div className="detail-item">
                <span>Погода:</span>
                <span>{weatherCodes[weather.daily.weathercode[selectedDay]]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {forecastPeriod === 'today' && <CurrentWeather weather={weather} currentDate={currentDate} />}
      {forecastPeriod === 'tomorrow' && <TomorrowWeather weather={weather} onDayClick={setSelectedDay} />}
      {forecastPeriod === '3days' && <MultiDayForecast days={3} weather={weather} onDayClick={setSelectedDay} />}
      {forecastPeriod === '6days' && <MultiDayForecast days={6} weather={weather} onDayClick={setSelectedDay} />}
       <MobileTemperatureWidget weather={weather} />
    </div>
  );
}