import React, { useState, useEffect } from 'react';
import { LocationMarkerIcon, SunIcon, CloudIcon, CloudRainIcon, ClockIcon } from './Icons';

type WeatherIconType = 'sun' | 'cloud' | 'rain';

const weatherIcons: Record<WeatherIconType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  sun: SunIcon,
  cloud: CloudIcon,
  rain: CloudRainIcon,
};

interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  icon: WeatherIconType;
  forecast: Array<{
    time: string;
    temp: number;
    icon: WeatherIconType;
  }>;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // This simulates fetching weather data. In a real app, this would be an API call.
    const simulatedData: WeatherData = {
      location: "Green Valley Farm",
      temp: 24,
      condition: 'Partly Cloudy',
      icon: 'cloud',
      forecast: [
        { time: '3PM', temp: 25, icon: 'cloud' },
        { time: '6PM', temp: 22, icon: 'sun' },
        { time: '9PM', temp: 19, icon: 'sun' }, // Using sun for clear night for icon simplicity
      ]
    };
    setWeather(simulatedData);
  }, []);

  if (!weather) {
    return (
      <div className="p-4 bg-surface rounded-lg shadow-lg flex items-center justify-center h-full">
        <p className="text-text-secondary">Loading weather...</p>
      </div>
    );
  }

  const CurrentWeatherIcon = weatherIcons[weather.icon];

  return (
    <div className="p-4 sm:p-6 bg-surface rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-2 text-text-secondary mb-4">
        <LocationMarkerIcon className="w-5 h-5" />
        <h3 className="font-semibold">{weather.location}</h3>
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-center gap-4 text-center my-4">
            <CurrentWeatherIcon className="w-20 h-20 text-primary" />
            <div>
                <p className="text-5xl font-bold text-text-primary">{weather.temp}°C</p>
                <p className="text-lg text-text-secondary">{weather.condition}</p>
            </div>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-text-secondary" />
            Hourly Forecast
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            {weather.forecast.map((item, index) => {
              const ForecastIcon = weatherIcons[item.icon];
              return (
                <div key={index} className="p-2 bg-background dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm font-medium text-text-secondary">{item.time}</p>
                  <ForecastIcon className="w-8 h-8 mx-auto my-1 text-secondary" />
                  <p className="text-lg font-bold text-text-primary">{item.temp}°</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
