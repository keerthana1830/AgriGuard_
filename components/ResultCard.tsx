import React, { useState } from 'react';
import type { ScanResult, Pesticide } from '../types';
import { BugAntIcon, LeafIcon, BookOpenIcon, LightbulbIcon, PercentIcon, PlusCircleIcon } from './Icons';
import { SprinklerAnimation } from './SprinklerAnimation';
import { soundService } from '../services/soundService';

interface ResultCardProps {
  result: ScanResult;
  image: string;
  setCurrentView: (view: 'dashboard' | 'history' | 'field' | 'resources') => void;
  recommendedPesticide: Pesticide | null;
  onLogRecommendedPurchase: (pesticide: Pesticide) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, image, setCurrentView, recommendedPesticide, onLogRecommendedPurchase }) => {
  const [isSpraying, setIsSpraying] = useState(false);
  const { pestName, infectionLevel, recommendation, reasoning } = result;

  const getInfectionColorScheme = (level: number) => {
    if (level > 60) return {
      bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-500/50 dark:border-red-500/40',
      button: 'bg-red-500 hover:bg-red-600',
    };
    if (level > 30) return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500/50 dark:border-yellow-500/40',
      button: 'bg-yellow-500 hover:bg-yellow-600',
    };
    return {
      bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-500/50 dark:border-green-500/40',
      button: 'bg-green-500 hover:bg-green-600',
    };
  };

  const colorScheme = getInfectionColorScheme(infectionLevel);

  const handleAction = () => {
    soundService.play('click');
    const actionTriggerWords = ['sprinkler', 'pesticide', 'fungicide', 'apply', 'spray', 'dispense'];
    const lowercasedRecommendation = recommendation.toLowerCase();

    if (actionTriggerWords.some(word => lowercasedRecommendation.includes(word))) {
      setIsSpraying(true);
    } else {
      // For actions that don't involve spraying, we provide a confirmation
      // and then navigate to the field view.
      alert(`Action Recorded: "${recommendation}"`);
      setCurrentView('field');
    }
  };

  const handleAnimationEnd = () => {
    setIsSpraying(false);
    setCurrentView('field');
  };
  
  const handleLogPurchaseClick = (pesticide: Pesticide) => {
    soundService.play('click');
    onLogRecommendedPurchase(pesticide);
  };

  return (
    <div className={`border ${colorScheme.border} ${colorScheme.bg} rounded-xl shadow-lg overflow-hidden animate-fade-in`}>
      {isSpraying && <SprinklerAnimation onEnd={handleAnimationEnd} />}
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img className="h-48 w-full object-cover md:h-full md:w-48" src={image} alt="Scanned plant" />
        </div>
        <div className="p-6 md:p-8 flex-grow">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${colorScheme.text}`}>Diagnosis</p>
              <div className="flex items-center gap-2">
                <BugAntIcon className={`w-8 h-8 ${colorScheme.text}`} />
                <h2 className={`mt-1 text-2xl md:text-3xl font-bold ${colorScheme.text}`}>{pestName}</h2>
              </div>
            </div>
            <div className={`flex items-center gap-2 flex-shrink-0 px-3 py-1 text-sm font-bold rounded-full text-white ${colorScheme.button}`}>
              <PercentIcon className="w-5 h-5" />
              <span>{infectionLevel}% Infected</span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-text-secondary font-semibold">Infection Level Meter:</p>
            <div className="relative w-full h-4 mt-2 rounded-full overflow-hidden flex shadow-inner bg-gray-200 dark:bg-slate-700">
              {/* Segments */}
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: '30%' }}></div>
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: '30%' }}></div>
              <div className="h-full bg-gradient-to-r from-red-500 to-red-700" style={{ width: '40%' }}></div>
              
              {/* Indicator Needle */}
              <div 
                className={`absolute top-[-4px] h-6 w-1 bg-gray-800 dark:bg-slate-300 border-2 border-white dark:border-slate-800 rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-700 ease-out ${infectionLevel > 60 ? 'animate-pulse-strong' : ''}`}
                style={{ left: `${infectionLevel}%` }}
                aria-label={`Infection Level: ${infectionLevel}%`}
              >
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">
                <span>Healthy</span>
                <span>Moderate</span>
                <span>Severe</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-4 text-text-secondary">
            <p className="flex items-start gap-3">
              <BookOpenIcon className={`w-6 h-6 ${colorScheme.text} flex-shrink-0 mt-0.5`} />
              <div>
                <span className="font-bold text-text-primary">Reasoning:</span>
                <span className="ml-1">{reasoning}</span>
              </div>
            </p>
            <p className="flex items-start gap-3">
              <LightbulbIcon className={`w-6 h-6 ${colorScheme.text} flex-shrink-0 mt-0.5`} />
              <div>
                <span className="font-bold text-text-primary">Recommendation:</span>
                <span className="ml-1">{recommendation}</span>
              </div>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
             {recommendedPesticide && (
              <button
                onClick={() => handleLogPurchaseClick(recommendedPesticide)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Log Purchase
              </button>
            )}
            <button
              onClick={handleAction}
              disabled={pestName.toLowerCase() === 'none' || infectionLevel === 0}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${colorScheme.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed`}
            >
              <LeafIcon className="w-5 h-5 mr-2" />
              Take Action
            </button>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes pulse-strong {
          0%, 100% {
            transform: scaleY(1) translateX(-50%);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            transform: scaleY(1.2) translateX(-50%);
            box-shadow: 0 0 10px 5px rgba(220, 38, 38, 0);
          }
        }
        .animate-pulse-strong {
          animation: pulse-strong 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
