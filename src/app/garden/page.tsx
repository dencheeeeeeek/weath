'use client';
import { useState } from "react";

export default function GardenPage(){
    const [selectedDate, setSelectedDate] = useState(new Date())

    const getMoonPhase = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let r = year % 100;
        r %= 19;
        if (r > 9) r -= 19;
        r = ((r * 11) % 30) + month + day;
        if (month < 3) r += 2;
        r -= 8.3;
        r = Math.floor(r + 0.5) % 30;

        if (r < 0) r += 30;
        
        if (r < 1) return { phase: "🌑 Новолуние", advice: "Неблагоприятно для посадок. Займитесь планированием и уборкой." };
        if (r < 7) return { phase: "🌒 Растущая луна", advice: "Сажайте зелень, цветы, культуры с надземными плодами." };
        if (r < 15) return { phase: "🌕 Полнолуние", advice: "Идеальное время для сбора урожая, прополки и подкормки." };
        if (r < 22) return { phase: "🌖 Убывающая луна", advice: "Сажайте корнеплоды, луковичные, проводите обрезку." };
        return { phase: "🌘 Старая луна", advice: "Подготовка почвы, борьба с вредителями, уборка территории." };
    };

    const moonPhase = getMoonPhase(selectedDate);
    
    return(
        <div className="container">
            <div className="top-section">
                <div className="logo-section">
                    <div className="logo-main">WINTER</div>
                    <div className="logo-sub">SALE</div>
                </div>
            </div>
            <div className="main-content">
                <div className="left-column">
                    <div className="weather-header">
                        <div className="weather-title">🌱 Календарь дачника</div>
                        <div className="location">Омск и Омская область</div>
                    </div>

                    <div className="date-section">
                        <div className="day">
                            {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase()}
                        </div>
                        <div className="date">
                            {selectedDate.toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'numeric', 
                                year: 'numeric'
                            }).replace(/\./g, '.')}
                        </div>
                    </div>

                    <div className="weather-details">
                        <div className="detail-item">
                            <span className="detail-label-large">Фаза луны:</span>
                            <span className="detail-value-large">{moonPhase.phase}</span>
                        </div>
                        <div className="advice-section">
                            <div className="advice-title">Рекомендации:</div>
                            <div className="advice-text-large">{moonPhase.advice}</div>
                        </div>
                    </div>

                    <div className="navigation-section">
                        <a href="/" className="nav-button">
                            ← Назад к погоде
                        </a>
                    </div>
                </div>

                <div className="right-column">
                    <div className="weather-widget temperature-widget">
                        <div className="widget-content">
                            <div className="weather-condition">
                                Лунный календарь
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}