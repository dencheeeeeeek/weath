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
            <div className="header">
                <h1>🌱 Календарь дачника</h1>
                <p>Омск и Омская область</p>
            </div>

            <div className="widget">
                <div className="widget-title">🌙 Фаза луны</div>
                <div className="moon-phase">{moonPhase.phase}</div>
                <div className="moon-advice">{moonPhase.advice}</div>
                <div className="current-date">
                {selectedDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    weekday: 'long'
                })}
            </div>
            </div>

            
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <a href="/" className="nav-button">
                    ← Назад к погоде
                </a>
            </div>
        </div>
    );
}