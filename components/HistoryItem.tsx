import React from 'react';
import type { HistoryEntry } from '../types';
import { BugAntIcon, SparklesIcon, TrashIcon, SunIcon, CloudIcon, CloudRainIcon } from './Icons';
import { soundService } from '../services/soundService';

interface HistoryItemProps {
  entry: HistoryEntry;
  onDelete: (id: string) => void;
}

const WeatherIcon: React.FC<{ icon: HistoryEntry['weather']['icon'] }> = ({ icon }) => {
    switch (icon) {
        case 'sun': return <SunIcon className="w-5 h-5 text-yellow-500" />;
        case 'cloud': return <CloudIcon className="w-5 h-5 text-gray-500" />;
        case 'rain': return <CloudRainIcon className="w-5 h-5 text-blue-500" />;
        default: return null;
    }
};

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry, onDelete }) => {
  const { id, image, result, date, weather } = entry;
  const infectionLevel = result.infectionLevel;
  
  let bgColor = 'bg-green-50 dark:bg-green-900/20';
  let borderColor = 'border-green-200 dark:border-green-800/50';
  if (infectionLevel > 30) {
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
    borderColor = 'border-yellow-200 dark:border-yellow-800/50';
  }
  if (infectionLevel > 60) {
    bgColor = 'bg-red-50 dark:bg-red-900/20';
    borderColor = 'border-red-200 dark:border-red-800/50';
  }
  
  const handleDelete = () => {
    soundService.play('click');
    if (window.confirm('Are you sure you want to delete this scan record? This action cannot be undone.')) {
      onDelete(id);
    }
  };

  return (
    <div className={`relative flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg shadow-md border ${borderColor} ${bgColor}`}>
      <img src={image} alt="Scanned plant" className="w-full sm:w-32 sm:h-32 h-48 object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-text-primary">{result.pestName}</p>
                <p className="text-sm text-text-secondary">{new Date(date).toLocaleString()}</p>
                {weather && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <WeatherIcon icon={weather.icon} />
                        <span>{weather.temp}°C, {weather.condition}</span>
                    </div>
                )}
            </div>
            <div className={`px-3 py-1 text-sm font-bold rounded-full text-white ${infectionLevel > 60 ? 'bg-red-500' : infectionLevel > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                {infectionLevel}% Infected
            </div>
        </div>
        <div className="mt-3 text-sm space-y-2">
           <p className="flex items-start gap-2">
                <BugAntIcon className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                <span className="font-semibold mr-1 text-text-primary">Reasoning:</span>
                <span className="text-text-secondary">{result.reasoning}</span>
            </p>
            <p className="flex items-start gap-2">
                <SparklesIcon className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                <span className="font-semibold mr-1 text-text-primary">Action Taken:</span>
                <span className="text-text-secondary">{result.recommendation}</span>
            </p>
        </div>
      </div>
       <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
        aria-label="Delete scan"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
