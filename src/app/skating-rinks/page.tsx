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
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<any>(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Загрузка Яндекс Карт
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapLoaded) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ВАШ_КЛЮЧ&lang=ru_RU';
      script.onload = () => {
        setMapLoaded(true);
        initMap();
      };
      script.onerror = () => {
        console.log('Яндекс Карты не загрузились, используем список');
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  const initMap = () => {
    if (window.ymaps) {
      window.ymaps.ready(() => {
        mapRef.current = new window.ymaps.Map('map', {
          center: [54.9924, 73.3686],
          zoom: 12,
          controls: ['zoomControl', 'typeSelector']
        });

        skatingRinks.forEach(rink => {
          const placemark = new window.ymaps.Placemark(
            [rink.lat, rink.lon],
            {
              balloonContent: `
                <div style="padding: 10px; max-width: 250px;">
                  <h3 style="margin: 0 0 10px 0; color: #1e40af;">${rink.name}</h3>
                  <p><strong>📍 Адрес:</strong> ${rink.address}</p>
                  <p><strong>💰 Цена:</strong> ${rink.price}</p>
                  <p><strong>🕐 Часы:</strong> ${rink.hours}</p>
                </div>
              `
            },
            {
              preset: 'islands#blueSportIcon'
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
      
      {/* ВЕРХНЯЯ СЕКЦИЯ ДЛЯ МОБИЛКИ */}
      <div className="top-section" style={isMobile ? { 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px'
      } : {}}>
        <div className="logo-section" style={isMobile ? { textAlign: 'center' } : {}}>
          <div className="logo-main">WINTER</div>
          <div className="logo-sub">SALE</div>
        </div>
        
        <div className="time-section" style={isMobile ? { textAlign: 'center' } : {}}>
          <h1 style={{ 
            color: 'white', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontSize: isMobile ? '24px' : '28px',
            margin: 0
          }}>
            ⛸️ Катки Омска
          </h1>
          {!isMobile && (
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              marginTop: '5px',
              fontSize: '16px'
            }}>
              {skatingRinks.length} открытых катков
            </p>
          )}
        </div>
        
        <div className="auth-section" style={isMobile ? { width: '100%' } : {}}>
          <Link 
            href="/" 
            className="login-btn"
            style={isMobile ? {
              width: '100%',
              maxWidth: '200px',
              margin: '0 auto',
              display: 'block'
            } : {}}
          >
            ← На главную
          </Link>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ - АДАПТИВНЫЙ */}
      <div className="main-content" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '25px' : '40px',
        alignItems: 'start'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА - КАРТА ИЛИ СПИСОК */}
        <div className="left-column">
          {!isMobile ? (
            // На ПК - карта
            <div id="map" style={{ 
              width: '100%', 
              height: '500px', 
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}></div>
          ) : (
            // На мобилке - список катков
            <div className="mobile-rinks-list">
              <h2 style={{
                color: 'white',
                marginBottom: '20px',
                fontSize: '22px',
                textAlign: 'center'
              }}>
                Список катков ({skatingRinks.length})
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {skatingRinks.map(rink => (
                  <div 
                    key={rink.id}
                    onClick={() => setSelectedRink(rink)}
                    style={{
                      background: selectedRink?.id === rink.id 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: `2px solid ${selectedRink?.id === rink.id ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '15px',
                      padding: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        {rink.name}
                      </h3>
                      <span style={{
                        background: rink.price.includes('Бесплатно') ? '#10b981' : '#f59e0b',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {rink.price}
                      </span>
                    </div>
                    
                    <p style={{
                      margin: '5px 0',
                      fontSize: '14px',
                      opacity: 0.9
                    }}>
                      📍 {rink.address}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '10px'
                    }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        🕐 {rink.hours}
                      </span>
                      <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Инструкция (только на ПК) */}
          {!isMobile && (
            <div style={{ 
              marginTop: '25px', 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ marginBottom: '10px' }}>🎯 Как пользоваться картой:</h3>
              <ul style={{ 
                paddingLeft: '20px', 
                margin: 0,
                fontSize: '15px',
                opacity: 0.9
              }}>
                <li>Нажмите на метку ⛸️ для информации о катке</li>
                <li>Используйте колесо мыши для увеличения</li>
                <li>Перетаскивайте карту для навигации</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* ПРАВАЯ КОЛОНКА - ИНФОРМАЦИЯ */}
        <div className="right-column" style={isMobile ? { order: -1 } : {}}>
          {/* Виджет с информацией */}
          <div className="weather-widget temperature-widget" style={{ 
            minHeight: 'auto',
            padding: isMobile ? '20px' : '25px'
          }}>
            <h2 style={{ 
              marginBottom: '20px',
              color: 'white',
              fontSize: isMobile ? '20px' : '22px'
            }}>
              {selectedRink ? selectedRink.name : 'Информация о катках'}
            </h2>
            
            {selectedRink ? (
              <div className="rink-details" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>📍</span>
                    <strong>Адрес:</strong>
                  </div>
                  <p style={{ margin: 0, opacity: 0.9 }}>{selectedRink.address}</p>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
                  gap: '15px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span>💰</span>
                      <strong>Цена:</strong>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: selectedRink.price.includes('Бесплатно') ? '#4ade80' : '#fbbf24',
                      fontWeight: 'bold'
                    }}>
                      {selectedRink.price}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span>🕐</span>
                      <strong>Часы:</strong>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9 }}>{selectedRink.hours}</p>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span>❄️</span>
                      <strong>Лёд:</strong>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span>⭐</span>
                      <strong>Услуги:</strong>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                      {selectedRink.features.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⛸️</div>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  {isMobile 
                    ? 'Нажмите на каток в списке для подробной информации' 
                    : 'Выберите каток на карте для подробной информации'
                  }
                </p>
                
                {/* Статистика */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '15px',
                  borderRadius: '10px',
                  marginTop: '25px',
                  textAlign: 'left'
                }}>
                  <h4 style={{ marginBottom: '10px', color: 'white' }}>📊 Статистика:</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '14px'
                  }}>
                    <div>Всего катков: <strong>{skatingRinks.length}</strong></div>
                    <div>Бесплатных: <strong style={{ color: '#4ade80' }}>
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
          
          {/* Блок с советами */}
          <div className="weather-widget condition-widget" style={{
            marginTop: '20px',
            padding: isMobile ? '20px' : '25px'
          }}>
            <h3 style={{ 
              marginBottom: '15px',
              color: 'white',
              fontSize: isMobile ? '18px' : '20px'
            }}>
              ❄️ Советы по катанию:
            </h3>
            <ul style={{ 
              paddingLeft: '20px', 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <li style={{ color: 'white', opacity: 0.9 }}>👕 Одевайтесь в несколько слоёв</li>
              <li style={{ color: 'white', opacity: 0.9 }}>⛸️ Проверяйте заточку коньков</li>
              <li style={{ color: 'white', opacity: 0.9 }}>⏰ Избегайте пиковых часов (18:00-20:00)</li>
              <li style={{ color: 'white', opacity: 0.9 }}>☕ Берите термос с горячим чаем</li>
              {isMobile && (
                <li style={{ color: 'white', opacity: 0.9 }}>📱 Сохраняйте эту страницу в закладках</li>
              )}
            </ul>
          </div>
          
          {/* Кнопка назад на мобилке (внизу) */}
          {isMobile && (
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <Link 
                href="/" 
                className="login-btn"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  fontSize: '16px'
                }}
              >
                ← Вернуться на главную
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}