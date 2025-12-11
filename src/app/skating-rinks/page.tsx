'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

declare global {
  interface Window {
    ymaps: any;
  }
}

const Snowfall = dynamic(() => import('react-snowfall'), { ssr: false });

interface SkatingRink {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address: string;
  price: string;
  hours: string;
  features: string[];
}

const skatingRinks: SkatingRink[] = [
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
];

export default function SkatingRinksPage() {
  const [selectedRink, setSelectedRink] = useState<SkatingRink | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapLoaded) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ВАШ_КЛЮЧ&lang=ru_RU';
      script.onload = () => {
        setMapLoaded(true);
        initMap();
      };
      script.onerror = () => {
        console.log('Яндекс Карты не загрузились');
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  const initMap = () => {
    if (window.ymaps) {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map('map', {
          center: [54.9924, 73.3686],
          zoom: 12,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
        });

        mapRef.current = map;

        skatingRinks.forEach(rink => {
          const placemark = new window.ymaps.Placemark(
            [rink.lat, rink.lon],
            {
              balloonContent: `
                <div class="map-balloon">
                  <h3>${rink.name}</h3>
                  <p><strong>📍 Адрес:</strong> ${rink.address}</p>
                  <p><strong>💰 Цена:</strong> ${rink.price}</p>
                  <p><strong>🕐 Часы:</strong> ${rink.hours}</p>
                  <p><strong>⭐ Услуги:</strong> ${rink.features.join(', ')}</p>
                </div>
              `
            },
            {
              preset: 'islands#blueSportIcon',
              iconColor: '#3b82f6'
            }
          );
          
          placemark.events.add('click', () => {
            setSelectedRink(rink);
          });
          
          map.geoObjects.add(placemark);
        });
      });
    }
  };

  return (
    <div className="container skating-page">
      <Snowfall
        color="#FFFFFF"
        speed={[0.5, 2]}
        radius={[2, 7]}
        snowflakeCount={100}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      <div className="top-section skating-top">
        <div className="logo-section">
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
        
        <div className="time-section skating-title">
          <h1>⛸️ Катки Омска</h1>
          <p className="skating-subtitle">{skatingRinks.length} открытых катков</p>
        </div>
        
        <div className="auth-section">
          <Link href="/" className="login-btn skating-back-btn">
            ← На главную
          </Link>
        </div>
      </div>

      <div className="skating-main-content">
        <div className="skating-left-column">
          <div id="map" className="skating-map"></div>
          
          <div className="map-instruction">
            <h3>🎯 Как пользоваться картой:</h3>
            <ul>
              <li>Нажмите на метку ⛸️ для информации о катке</li>
              <li>Используйте колесо мыши для увеличения</li>
              <li>Перетаскивайте карту для навигации</li>
            </ul>
          </div>
        </div>
        
        <div className="skating-right-column">
          <div className="skating-info-card">
            <h2>{selectedRink ? selectedRink.name : 'Информация о катках'}</h2>
            
            {selectedRink ? (
              <div className="rink-details">
                <div className="rink-detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <strong>Адрес:</strong>
                    <p>{selectedRink.address}</p>
                  </div>
                </div>
                
                <div className="rink-details-grid">
                  <div className="detail-box">
                    <span className="detail-icon">💰</span>
                    <div>
                      <strong>Цена:</strong>
                      <p className={selectedRink.price.includes('Бесплатно') ? 'free-price' : 'paid-price'}>
                        {selectedRink.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="detail-box">
                    <span className="detail-icon">🕐</span>
                    <div>
                      <strong>Часы:</strong>
                      <p>{selectedRink.hours}</p>
                    </div>
                  </div>
                  
                  <div className="detail-box">
                    <span className="detail-icon">❄️</span>
                    <div>
                    </div>
                  </div>
                  
                  <div className="detail-box">
                    <span className="detail-icon">⭐</span>
                    <div>
                      <strong>Услуги:</strong>
                      <p>{selectedRink.features.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">⛸️</div>
                <p>Выберите каток на карте для подробной информации</p>
                
                <div className="skating-stats">
                  <h4>📊 Статистика:</h4>
                  <div className="stats-grid">
                    <div>Всего катков: <strong>{skatingRinks.length}</strong></div>
                    <div>Бесплатных: <strong className="free-count">
                      {skatingRinks.filter(r => r.price.includes('Бесплатно')).length}
                    </strong></div>
                    <div>Крытых: <strong>
                      {skatingRinks.filter(r => r.features.includes('Крытый')).length}
                    </strong></div>
                    <div>С прокатом: <strong>
                      {skatingRinks.filter(r => r.features.includes('Прокат коньков')).length}
                    </strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="skating-tips-card">
            <h3>❄️ Советы по катанию:</h3>
            <ul className="skating-tips-list">
              <li>👕 Одевайтесь в несколько слоёв</li>
              <li>⛸️ Проверяйте заточку коньков</li>
              <li>⏰ Избегайте пиковых часов (18:00-20:00)</li>
              <li>☕ Берите термос с горячим чаем</li>
              {isMobile && <li>📱 Сохраняйте эту страницу в закладках</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}