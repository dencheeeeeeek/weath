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

// ВРЕМЕННО: Отключаем Supabase для сборки
const ENABLE_SUPABASE = false;

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

const getFishingAdvice = (weather: WeatherData, isTomorrow: boolean = false) => {
  const currentPressure = weather.hourly.pressure_msl[0];
  const tomorrowPressure = weather.hourly.pressure_msl[24];
  const pressureChange = tomorrowPressure - currentPressure;
  
  const temp = isTomorrow ? weather.daily.temperature_2m_max[1] : weather.current_weather.temperature;
  const weatherCode = isTomorrow ? weather.daily.weathercode[1] : weather.current_weather.weathercode;
  const wind = weather.current_weather.windspeed;

  let mood = "";
  let advice = "";
  let bait = "";

  if (pressureChange > 3) {
    mood = "🐟 Рыба в приподнятом настроении! Активно ищет еду";
    advice = "Идеальное время для экспериментов с приманками";
    bait = "Попробуй яркие блёсны и воблеры";
  } else if (pressureChange < -3) {
    mood = "😴 Рыба вялая, как студент на паре в понедельник утром";
    advice = "Лучше остаться дома с чаем";
    bait = "Разве что дошик попробовать...";
  } else if (Math.abs(pressureChange) < 1) {
    mood = "😐 Рыба в стабильном настроении - как омич в пробке на Ленина";
    advice = "Стабильный клёв, но без сюрпризов";
    bait = "Классические черви и опарыши";
  } else {
    mood = "🤔 Рыба задумалась о смысле жизни";
    advice = "Нужно проявить терпение и хитрость";
    bait = "Медленная проводка, натуральные приманки";
  }

  if (temp < -15) {
    mood = "❄️ Рыба в анабиозе, как медведь в берлоге";
    advice = "Нужна сверхтерпеливая зимняя рыбалка";
    bait = "Мормышка с мотылём, много горячего чая";
  }

  if (wind > 10) {
    mood = "🌪️ Рыбу качает как на аттракционе";
    advice = "Ищи затишки за камышом или сиди дома";
    bait = "Тяжёлые грузила, чтобы не сдувало";
  }

  if ([71, 73, 75, 85, 86].includes(weatherCode)) {
    mood = "🌨️ Рыба под снежным покровом - как в сказке";
    advice = "Отличное время для зимней сказки с удочкой";
    bait = "Красная мормышка - как ягодка под снегом";
  }

  return {
    mood,
    advice, 
    bait,
    pressureChange: pressureChange.toFixed(1),
    isGood: pressureChange > 2 && temp > -10 && wind < 8
  };
};

const MiltiDayForecast = ({days, weather, onDayClick} : {days:number, weather:WeatherData, onDayClick: (dayIndex: number) => void}) => {
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

const TomorrowWeather = ({ weather, onDayClick }: { weather: WeatherData, onDayClick?: (dayIndex: number) => void }) => {
  const tomorrowIndex = 1;
  const fishingAdvice = getFishingAdvice(weather, true);

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

          <div className="clothing-advice-section">
            <div className="section-title">👕 Рекомендации по одежде</div>
            {getClothingAdvice(weather, true).map((item, index) => (
              <div key={index} className="advice-item">{item}</div>
            ))}
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
            📊 Давление меняется на {fishingAdvice.pressureChange} гПа
            {Math.abs(parseFloat(fishingAdvice.pressureChange)) > 3 && " ⚠️"}
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
            <span>{Math.round(weather.hourly.pressure_msl[0])} гПа</span>
          </div>
          <div className="detail-item">
            <span>Ветер:</span>
            <span>{weather.current_weather.windspeed.toFixed(1)} м/с</span>
          </div>

          <div className="clothing-advice-section">
            <div className="section-title">👕 Рекомендации по одежде</div>
            {getClothingAdvice(weather, false).map((item, index) => (
              <div key={index} className="advice-item">{item}</div>
            ))}
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
            📊 Давление меняется на {fishingAdvice.pressureChange} гПа
            {Math.abs(parseFloat(fishingAdvice.pressureChange)) > 3 && " ⚠️"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [forecastPeriod, setForecastPeriod] = useState('today');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // ВРЕМЕННО: Отключаем auth состояния
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

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

  // ВРЕМЕННО: Упрощенная auth функция
  const handleAuth = async (isLogin: boolean) => {
    if (!ENABLE_SUPABASE) {
      setAuthError('Авторизация временно отключена');
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
      // Временная заглушка
      setAuthSuccess(isLogin ? 'Вход выполнен (заглушка)' : 'Регистрация успешна (заглушка)');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setUser({ email, username });
      }, 1500);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setUser(null);
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
        <div className="auth-section">
          {user ? (
            <div className="user-section">
              <span className="username">
                👤 {user.username || user.email?.split('@')[0] || 'Пользователь'}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setIsAuthModalOpen(true)}>
              👤 Войти
            </button>
          )}
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
        <Link href="/districts" className="districts-btn">
          🗺️ Районы
        </Link>
        {/* Временное отключение favorites */}
        {/* <Link href="/favorites" className="districts-btn">
          ⭐ Избранное
        </Link> */}
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
                {!ENABLE_SUPABASE && (
                  <div className="auth-warning">
                    ⚠️ Авторизация временно в режиме заглушки
                  </div>
                )}
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
                {!ENABLE_SUPABASE && (
                  <div className="auth-warning">
                    ⚠️ Авторизация временно в режиме заглушки
                  </div>
                )}
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
                <span>Погода:</span>
                <span>{weatherCodes[weather.daily.weathercode[selectedDay]]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {forecastPeriod === 'today' && <CurrentWeather weather={weather} currentDate={currentDate} />}
      {forecastPeriod === 'tomorrow' && <TomorrowWeather weather={weather} onDayClick={setSelectedDay} />}
      {forecastPeriod === '3days' && <MiltiDayForecast days={3} weather={weather} onDayClick={setSelectedDay} />}
      {forecastPeriod === '6days' && <MiltiDayForecast days={6} weather={weather} onDayClick={setSelectedDay} />}
    </div>
  );
}