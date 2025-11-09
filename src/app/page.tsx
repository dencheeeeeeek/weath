import Image from "next/image";
import styles from "./page.module.css";

async function GetWeather(){
  const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true&timezone=auto",
{
  cache: 'no-store'
  }
);
const data = await response.json();
return data
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
export default async function Home(){
  const weather = await GetWeather();
  return(
<div style={{padding: '20px', fontFamily:'Arial'}}>
  <div style={{textAlign: "center", fontWeight: "bold"}}>
    <h1>Омск</h1>
  </div>
  <div style={{fontSize: '48px', fontWeight:"bold", textAlign:"center"}}>
    {weather?.current_weather?.temperature
    ? Math.round(weather.current_weather.temperature)
    : "-"
    }°C
  </div>
  <div style={{fontSize: '20px', textAlign: 'center'}}>
    {weatherCodes[weather?.current_weather?.weathercode] || "Неизвестно"}
  </div>
  <div style={{fontSize: '14px', textAlign: "center", color:"gray", marginTop: '10px' }}>
  Ветер: {weather.current_weather.windspeed} м/c
  </div>
</div>
  );
}
