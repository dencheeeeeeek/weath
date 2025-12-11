'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';


// Добавь в начало файла skating-rinks/page.tsx
declare global {
  interface Window {
    ymaps: any;
  }
}
const Snowfall=dynamic(() => import('react-snowfall'),{ssr:false})

interface SkatingRink{
    id:number
    name:string
    lat:number
    lon:number
    address:string
    price:string
    hours:string
    features:string[]
}

const skatingRinks: SkatingRink[]=[
    {
        id:1,
        name: "Каток в Советском",
        lat:55.025928,
        lon:73.280738,
        address:"Парк культуры отдыха Советский",
        price:" от 350 со своими",
        hours:"10:00 - 23:00",
        features:["Прокат коньков, Кафе прямо на льду, освещение, открытый"]
    }
]

export default function SkatingRinksPage(){
    const [selectedRink, setSelectedRink] = useState<SkatingRink | null>(null)
    const mapRef=useRef<any>(null)
    const [mapLoaded, setMapLoaded] = useState(false);
    
    useEffect(()=>{
         if (typeof window !== 'undefined' && !mapLoaded) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=f5a824b2-ed5f-482e-a526-209cbeb52ebb&lang=ru_RU';
      script.onload = () => {
        setMapLoaded(true);
        initMap();
      };
      document.head.appendChild(script);
    }
     },[]
    )

     const initMap = () => {
    if (window.ymaps) {
      window.ymaps.ready(() => {
        mapRef.current = new window.ymaps.Map('map', {
          center: [54.9924, 73.3686],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем метки
        skatingRinks.forEach(rink => {
          const placemark = new window.ymaps.Placemark(
            [rink.lat, rink.lon],
            {
              balloonContent: `
                <div style="padding: 10px;">
                  <h3>${rink.name}</h3>
                  <p>${rink.address}</p>
                  <p>Цена: ${rink.price}</p>
                  <p>Часы: ${rink.hours}</p>
                </div>
              `
            },
            {
              preset: 'islands#blueIceSkateIcon'
            }
          );
          
          placemark.events.add('click', () => {
            setSelectedRink(rink);
          });
          
          mapRef.current.geoObjects.add(placemark);
        });
      });
    }
  };

  return (
    <div className="container">
      <Snowfall
        color="#FFFFFF"
        speed={[0.5, 2]}
        radius={[2, 7]}
        snowflakeCount={100}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
      />
      
      <div className="top-section">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
        <div className="time-section">
          <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>⛸️ Катки Омска</h1>
        </div>
        <div className="auth-section">
          <Link href="/" className="login-btn">
            ← Назад
          </Link>
        </div>
      </div>

      <div className="main-content" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="left-column">
          <div id="map" style={{ 
            width: '100%', 
            height: '500px', 
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}></div>
          
          <div style={{ marginTop: '30px', color: 'white' }}>
            <h2>🎯 Как пользоваться картой:</h2>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Нажмите на метку катка для информации</li>
              <li>Используйте колесо мыши для увеличения</li>
              <li>Перетаскивайте карту для навигации</li>
            </ul>
          </div>
        </div>
        
        <div className="right-column">
          <div className="weather-widget temperature-widget" style={{ minHeight: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Информация о катках</h2>
            
            {selectedRink ? (
              <div className="rink-details">
                <h3>{selectedRink.name}</h3>
                <p><strong>📍 Адрес:</strong> {selectedRink.address}</p>
                <p><strong>💰 Цена:</strong> {selectedRink.price}</p>
                <p><strong>🕐 Часы работы:</strong> {selectedRink.hours}</p>
                <p><strong>⭐ Особенности:</strong> {selectedRink.features.join(', ')}</p>
              </div>
            ) : (
              <div className="rink-details">
                <h3>Выберите каток на карте</h3>
                <p>Нажмите на любую метку ⛸️ чтобы увидеть подробную информацию</p>
                <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                  <h4>📊 Статистика:</h4>
                  <p>Всего катков: {skatingRinks.length}</p>
                  <p>Бесплатных: {skatingRinks.filter(r => r.price.includes('Бесплатно')).length}</p>
                  <p>Крытых: {skatingRinks.filter(r => r.features.includes('Крытый')).length}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="weather-widget condition-widget">
            <h3>❄️ Советы по катанию:</h3>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Одевайтесь теплее в несколько слоёв</li>
              <li>Проверяйте заточку коньков</li>
              <li>Избегайте пиковых часов (18:00-20:00)</li>
              <li>Берите термос с горячим чаем</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

