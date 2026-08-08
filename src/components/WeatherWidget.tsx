import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Search, MapPin, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '../types';
import { useLanguage } from '../LanguageContext';

const defaultCities: Record<string, WeatherData> = {
  dhaka: { city: 'Dhaka', temp: 32, condition: 'Sunny', humidity: 74, windSpeed: 12 },
  chittagong: { city: 'Chittagong', temp: 30, condition: 'Rainy', humidity: 85, windSpeed: 15 },
  sylhet: { city: 'Sylhet', temp: 28, condition: 'Stormy', humidity: 90, windSpeed: 18 },
  london: { city: 'London', temp: 18, condition: 'Cloudy', humidity: 62, windSpeed: 14 },
  tokyo: { city: 'Tokyo', temp: 24, condition: 'Cloudy', humidity: 55, windSpeed: 9 },
  'new york': { city: 'New York', temp: 22, condition: 'Sunny', humidity: 48, windSpeed: 11 },
};

export default function WeatherWidget() {
  const { t, isBn } = useLanguage();
  const [cityInput, setCityInput] = useState('');
  const [weather, setWeather] = useState<WeatherData>({
    city: 'Dhaka',
    temp: 32,
    condition: 'Sunny',
    humidity: 74,
    windSpeed: 12,
  });

  const getConditionName = (cond: string) => {
    switch (cond) {
      case 'Sunny': return t('রৌদ্রোজ্জ্বল', 'Sunny');
      case 'Cloudy': return t('মেঘলা', 'Cloudy');
      case 'Rainy': return t('বৃষ্টিপাত', 'Rainy');
      case 'Stormy': return t('ঝড়ো আবহাওয়া', 'Stormy');
      case 'Snowy': return t('তুষারপাত', 'Snowy');
      default: return cond;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCity = cityInput.trim().toLowerCase();
    if (!cleanCity) return;

    if (defaultCities[cleanCity]) {
      setWeather(defaultCities[cleanCity]);
    } else {
      const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomTemp = Math.floor(Math.random() * 25) + (randomCondition === 'Snowy' ? -5 : 15);
      const randomHumidity = Math.floor(Math.random() * 50) + 40;
      const randomWind = Math.floor(Math.random() * 20) + 5;

      setWeather({
        city: cityInput.charAt(0).toUpperCase() + cityInput.slice(1),
        temp: randomTemp,
        condition: randomCondition,
        humidity: randomHumidity,
        windSpeed: randomWind,
      });
    }
    setCityInput('');
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sunny':
        return <Sun className="w-12 h-12 text-amber-400 animate-spin-slow" />;
      case 'Rainy':
        return <CloudRain className="w-12 h-12 text-sky-400 animate-bounce-slow" />;
      case 'Stormy':
        return <CloudLightning className="w-12 h-12 text-purple-400 animate-pulse" />;
      case 'Snowy':
        return <CloudSnow className="w-12 h-12 text-slate-100" />;
      case 'Cloudy':
      default:
        return <Cloud className="w-12 h-12 text-slate-300" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-sky-500/30">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('ওয়েদার স্টেশন', 'Weather Station')}
          </span>
          <h3 className="text-lg font-semibold flex items-center gap-1.5 mt-0.5 text-slate-800 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-sky-500" />
            {weather.city}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {weather.temp}°C
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{getConditionName(weather.condition)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('আর্দ্রতা:', 'Humidity:')} {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('বাতাস:', 'Wind:')} {weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            placeholder={t('শহরের নাম...', 'Search city...')}
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="w-32 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 pr-8 text-slate-800 dark:text-slate-200"
          />
          <button type="submit" className="absolute right-2 text-slate-400 hover:text-sky-500 transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

