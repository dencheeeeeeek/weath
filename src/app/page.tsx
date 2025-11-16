'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Boldonse } from "next/font/google";
import { stat } from "fs";
import { DESTRUCTION } from "dns";

interface WeatherData{
  current_weather:{
    temperature:number;
    weathercode: number;
    windspeed: number;
  };
  hourly:{
    relativehumidity_2m: number[];
  };
  daily:{
    temperature_2m_max:number[];
    temperature_2m_min:number[];
    weathercode:number[];
  }
}

const weatherCodes: { [key: number]: string } = {
  0: "Ясно",
  1: "Преимущественно ясно", 
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Туман",
  51: "Легкая морось",
  53: "Морось", 
  55: "Сильная морось",
  56: "Ледяная морось",
  57: "Сильная ледяная морось",
  61: "Небольшой дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Ледяной дождь",
  67: "Сильный ледяной дождь",
  71: "Небольшой снег",        
  73: "Снег",                  
  75: "Сильный снег",          
  77: "Снежные зёрна",
  80: "Небольшой ливень",
  81: "Ливень",
  82: "Сильный ливень",
  85: "Небольшой снегопад",
  86: "Снегопад",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Сильная гроза с градом"
};

const getFishingAdvice = (weather: WeatherData) => {
  const temp = weather.current_weather.temperature;
  const wind = weather.current_weather.windspeed;
  if(temp > 15 && temp < 25 && wind < 5){
    return{
      status: "🎣 Идеальное время для рыбалки!",
      description: "Тепло, мало ветра - рыба активно клюёт"
    };
  } else if(temp < 5 || temp > 30){
    return{
      status: "❌ Плохой клёв",
      description: "Экстремальная температура - рыба пассивна"
    };
  } else if(wind > 8){
    return{
      status: "🌬️ Умеренный клёв",
      description: "Сильный ветер мешает рыбалке"
    };
  } else{
    return{
      status: "✅ Хороший клёв",
      description: "Благоприятные условия для ловли"
    };
  }
};

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  const updateTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('ru-RU', {timeZone: 'Asia/Omsk'}));
  };

  const getWeather = async () => {
    try{
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3"
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        <h1>Омск</h1>
      </div>
      <div style={{ fontSize: '48px', fontWeight: "bold", textAlign: "center" }}>
        {Math.round(weather.current_weather.temperature)}°C
      </div>
      <div style={{ fontSize: '20px', textAlign: 'center', fontWeight: 'bold'}}>
        {weatherCodes[weather.current_weather.weathercode]}
      </div>
      <div style={{ fontSize: '20px', textAlign: 'center', color: 'white', marginTop: '5px', fontWeight: 'bold'}}>
        Влажность в Омске: {weather.hourly.relativehumidity_2m[0]}%
      </div>
      <div style={{ fontSize: '20px', textAlign: "center", color: "#DDD", marginTop: '10px' }}>
        Ветер: {weather.current_weather.windspeed} м/с
      </div>
      <div style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', color: 'white', marginTop: '10px' }}>
        Время в Омске: {currentTime}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '15px',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          🐟 Рыбалка в Омске:
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          {fishingAdvice.status}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          {fishingAdvice.description}
        </div>
      </div>
    </div>
  );
}