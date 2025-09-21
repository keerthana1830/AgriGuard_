import React from 'react';
import type { PlayerStats } from '../types';
import { TrophyIcon, LeafIcon, CheckBadgeIcon } from './Icons';

interface ScoreCardProps {
  stats: PlayerStats;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ stats }) => {
  const { score, scans, level, levelName, progress, unlockedAchievements } = stats;

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Your Progress</h3>
      <div className="flex-grow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Rank</p>
            <p className="text-2xl font-bold text-primary">{levelName}</p>
          </div>
          <div className="text-center px-4 py-2 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-semibold">Level</p>
            <p className="text-2xl font-bold text-primary">{level}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-text-secondary">
            <span>Level Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-background dark:bg-slate-700 rounded-full h-3 shadow-inner">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-background dark:bg-slate-700/50 p-3 rounded-lg">
                <TrophyIcon className="w-8 h-8 mx-auto text-secondary" />
                <p className="mt-1 text-2xl font-bold text-text-primary">{score}</p>
                <p className="text-xs text-text-secondary">Total Score</p>
            </div>
             <div className="bg-background dark:bg-slate-700/50 p-3 rounded-lg">
                <LeafIcon className="w-8 h-8 mx-auto text-primary" />
                <p className="mt-1 text-2xl font-bold text-text-primary">{scans}</p>
                <p className="text-xs text-text-secondary">Plants Scanned</p>
            </div>
             <div className="bg-background dark:bg-slate-700/50 p-3 rounded-lg">
                <CheckBadgeIcon className="w-8 h-8 mx-auto text-blue-500" />
                <p className="mt-1 text-2xl font-bold text-text-primary">{unlockedAchievements}</p>
                <p className="text-xs text-text-secondary">Achievements</p>
            </div>
        </div>
      </div>
    </div>
  );
};