import Image from "next/image";
import styles from "./page.module.css";

async function GetWeather(){
  const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=54.9924&longitude=73.3686&current_weather=true") 
const data = await response.json();
return data.current_weather;
}

export default async function Home(){
  const weather = await GetWeather();
  return(
<div style={{padding: '20px', fontFamily:'Arial'}}>
  <h1>Погода в Омске</h1>
  <p>Температура: {weather.temperature}</p>
  <p>Ветер: {weather.windspeed}</p>
</div>
  );
}