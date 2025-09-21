import React, { useEffect, useState } from 'react';
import type { Achievement } from '../types';
import { TrophyIcon } from './Icons';
import { soundService } from '../services/soundService';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    soundService.play('toastAppear');
    // Animate in
    const inTimer = setTimeout(() => setVisible(true), 100);

    // Animate out
    const outTimer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling dismiss
      const dismissTimer = setTimeout(onDismiss, 300);
      return () => clearTimeout(dismissTimer);
    }, 4000);

    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [onDismiss]);
  
  const Icon = achievement.icon;

  return (
    <div 
        className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100%-2rem)] max-w-sm z-50 transform transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        role="alert"
        aria-live="assertive"
    >
      <div className="bg-surface rounded-xl shadow-2xl p-4 flex items-center gap-4 ring-2 ring-primary/50">
        <div className="flex-shrink-0">
          <div className="p-3 bg-yellow-400 rounded-full">
            <TrophyIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-grow">
          <p className="font-bold text-sm text-text-primary">Achievement Unlocked!</p>
          <p className="text-lg font-semibold text-primary">{achievement.name}</p>
        </div>
        <div className="flex-shrink-0 self-start">
           <Icon className="w-8 h-8 text-secondary"/>
        </div>
      </div>
    </div>
  );
};