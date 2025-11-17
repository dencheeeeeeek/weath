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
  };
  daily:{
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

const getSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'весна';
  if (month >= 6 && month <= 8) return 'лето';
  if (month >= 9 && month <= 11) return 'осень';
  return 'зима';
};

const getFishingAdvice = (weather: WeatherData) => {
  const temp = weather.current_weather.temperature;
  const wind = weather.current_weather.windspeed;
  const season = getSeason();

  if (season === 'весна') {
    if (temp > 8 && temp < 18 && wind < 6) {
      return {
        status: "🌸 Отличная весенняя рыбалка!",
        description: "Тёплая весенняя погода - рыба после зимы активно клюёт"
      };
    } else if (temp < 5) {
      return {
        status: "🌨️ Холодная весна",
        description: "Ещё холодно - рыба вялая, используйте мелкие приманки"
      };
    } else {
      return {
        status: "✅ Хорошая весенняя рыбалка",
        description: "Рыба постепенно активизируется после зимы"
      };
    }
  }

  if (season === 'лето') {
    if (temp > 18 && temp < 26 && wind < 5) {
      return {
        status: "🎣 Идеальная летняя рыбалка!",
        description: "Тёплая безветренная погода - рыба активно питается"
      };
    } else if (temp > 30) {
      return {
        status: "🔥 Слишком жарко",
        description: "Рыба уходит на глубину, клюёт рано утром и вечером"
      };
    } else if (wind > 8) {
      return {
        status: "💨 Ветрено",
        description: "Сильный ветер усложняет ловлю, ищите защищённые места"
      };
    } else {
      return {
        status: "✅ Хорошая летняя рыбалка",
        description: "Стабильный клёв в течение дня"
      };
    }
  }

  if (season === 'осень') {
    if (temp > 5 && temp < 15 && wind < 5) {
      return {
        status: "🍂 Идеальная осенняя рыбалка!",
        description: "Прохладно, безветренно - предзимний жор, отличный клёв!"
      };
    } else if (temp < 0) {
      return {
        status: "❄️ Ранние заморозки",
        description: "Первый лёд - осторожно, используйте зимние снасти"
      };
    } else {
      return {
        status: "✅ Хорошая осенняя рыбалка",
        description: "Рыба готовится к зиме, клюёт активно"
      };
    }
  }

  if (season === 'зима') {
    if (temp > -10 && temp < 0 && wind < 5) {
      return {
        status: "⛄ Отличная зимняя рыбалка!",
        description: "Лёгкий мороз без ветра - идеально для ловли на мормышку"
      };
    } else if (temp < -20) {
      return {
        status: "❄️ Сильный мороз",
        description: "Экстремально холодно - рыба малоподвижна на глубине"
      };
    } else if (wind > 8) {
      return {
        status: "🌬️ Порывистый ветер",
        description: "Ветер мешает зимней ловле - одевайтесь теплее"
      };
    } else {
      return {
        status: "✅ Нормальная зимняя рыбалка",
        description: "Стандартные зимние условия"
      };
    }
  }

  return {
    status: "🎣 Рыбалка",
    description: "Условия для рыбалки нормальные"
  };
};

const getClothingAdvice = (weather: WeatherData) => {
  const temp = weather.current_weather.temperature;
  const weatherCode = weather.current_weather.weathercode;
  
  if (temp < -10) return "❄️ Тёплая зимняя одежда, шапка, перчатки, тёплая обувь";
  if (temp < 0) return "🧥 Зимняя куртка, шапка, тёплая обувь";
  if (temp < 10) return "🧥 Тёплая куртка, головной убор";
  if (temp > 25) return "👕 Лёгкая одежда, головной убор от солнца";
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return "🌧️ Водонепроницаемая куртка, зонт, непромокаемая обувь";
  if ([71, 73, 75, 85, 86].includes(weatherCode)) return "⛄ Тёплая непромокаемая одежда, зимняя обувь";
  return "👔 Стандартная одежда по сезону";
};

const getWarnings = (weather: WeatherData) => {
  const warnings = [];
  const temp = weather.current_weather.temperature;
  const weatherCode = weather.current_weather.weathercode;
  
  if (temp > 0 && temp < 3) warnings.push("⚠️ Возможен гололёд - будьте аккуратнее");
  if (weather.current_weather.windspeed > 15) warnings.push("💨 Сильный ветер - осторожно на открытых участках");
  if (temp < -25) warnings.push("❄️ Экстремальный мороз - ограничьте время на улице");
  if ([95, 96, 99].includes(weatherCode)) warnings.push("⛈️ Гроза - избегайте открытых пространств");
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) warnings.push("🌧️ Ожидаются осадки - возьмите зонт");
  if(weather.hourly.precipitation[0]>5) warnings.push("🌧️ Сильные осадки - возьмите зонт");
  if(weather.daily.precipitation_sum[0]>10) warnings.push("Сегодня много осадков - наденьте непромокаемую обувь");
  return warnings;
};

export default function Home() {
  const [forecastPeriod, setForecastPeriod]=useState('today')
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const updateTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('ru-RU', {timeZone: 'Asia/Omsk'}));
  };

  const getWeather = async () => {
    try{
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true&hourly=relativehumidity_2m,pressure_msl,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3"
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

  if(!weather) return <div>Загрузка</div>;

  const fishingAdvice = getFishingAdvice(weather);
  const clothingAdvice = getClothingAdvice(weather);
  const warnings = getWarnings(weather);

  return (
    <div className="container">
      <div className="header">
        <div className="forecast-buttons">
    <button 
        className={forecastPeriod === 'today' ? 'active' : ''}
        onClick={() => setForecastPeriod('today')}
    >
        📅 Сегодня
    </button>
        <button 
        className={forecastPeriod === 'tomorrow' ? 'active' : ''}
        onClick={() => setForecastPeriod('tomorrow')}
    >
        📅 Завтра
    </button>
        <button 
        className={forecastPeriod === '3days' ? 'active' : ''}
        onClick={() => setForecastPeriod('3days')}
    >
        📅 3 дня
    </button>
        <button 
        className={forecastPeriod === '7days' ? 'active' : ''}
        onClick={() => setForecastPeriod('7days')}
    >
        📅 7 дней
    </button>
        </div>
        <h1>Омск</h1>
      </div>
      <div className="temperature">
        {Math.round(weather.current_weather.temperature)}°C
      </div>
      <div className="weather-description">
        {weatherCodes[weather.current_weather.weathercode]}
      </div>
      <div className="detail-item">
      <span>🌧️ Осадки сейчас:</span>
      <span>{weather.hourly.precipitation[0].toFixed(1)} мм</span>
      </div>
      <div className="detail-item">
      <span>📅 Осадки за день:</span>
      <span>{weather.daily.precipitation_sum[0].toFixed(1)} мм</span>
      </div>
      <div className="weather-details">
        <div className="detail-item">
          <span>💧 Влажность:</span>
          <span>{weather.hourly.relativehumidity_2m[0]}%</span>
        </div>
        <div className="detail-item">
          <span>🎈 Давление:</span>
          <span>{Math.round(weather.hourly.pressure_msl[0])} гПа</span>
        </div>
        <div className="detail-item">
          <span>💨 Ветер:</span>
          <span>{weather.current_weather.windspeed} м/с</span>
        </div>
      </div>

      <div className="time">
        Время в Омске: {currentTime}
      </div>
              <div className="button-container">
        <Link href="/garden" className="nav-link">🌱 Календарь дачника</Link>
        </div>

      {warnings.length > 0 && (
        <div className="warnings-widget">
          <div className="widget-title">⚠️ Предупреждения</div>
          {warnings.map((warning, index) => (
            <div key={index} className="warning-item">{warning}</div>
          ))}
        </div>
      )}

      <div className="fishing-widget">
        <div className="widget-title">🐟 Рыбалка в Омске</div>
        <div className="fishing-status">{fishingAdvice.status}</div>
        <div className="fishing-description">{fishingAdvice.description}</div>
      </div>

      <div className="clothing-widget">
        <div className="widget-title">👕 Рекомендации по одежде</div>
        <div className="clothing-advice">{clothingAdvice}</div>
      </div>
    </div>
  );
}