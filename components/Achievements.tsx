import React from 'react';
import type { Achievement, UnlockedAchievement } from '../types';
import { ALL_ACHIEVEMENTS } from '../services/achievements';
import { LockClosedIcon, CheckBadgeIcon } from './Icons';

interface AchievementsProps {
  unlockedAchievements: UnlockedAchievement[];
}

const AchievementCard: React.FC<{ achievement: Achievement; unlocked: UnlockedAchievement | undefined }> = ({ achievement, unlocked }) => {
    const Icon = achievement.icon;
    const isUnlocked = !!unlocked;

    return (
        <div className={`
            flex flex-col items-center text-center p-4 sm:p-6 rounded-xl shadow-lg border-2
            transition-all duration-300 transform hover:-translate-y-1
            ${isUnlocked 
                ? 'bg-surface border-primary/50' 
                : 'bg-background border-gray-200 dark:border-slate-700'
            }
        `}>
            <div className={`
                relative w-20 h-20 flex items-center justify-center rounded-full mb-4
                ${isUnlocked ? 'bg-primary/10' : 'bg-gray-200 dark:bg-slate-700'}
            `}>
                <Icon className={`
                    w-10 h-10 
                    ${isUnlocked ? 'text-primary' : 'text-gray-400 dark:text-slate-500'}
                `} />
                {isUnlocked ? (
                    <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-7 h-7 text-green-500 bg-surface rounded-full" />
                ) : (
                    <LockClosedIcon className="absolute -bottom-1 -right-1 w-6 h-6 p-1 text-text-secondary bg-surface rounded-full" />
                )}
            </div>
            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>{achievement.name}</h3>
            <p className="text-sm text-text-secondary flex-grow mt-1">{achievement.description}</p>
            {isUnlocked && (
                <p className="text-xs text-primary font-semibold mt-3">
                    Unlocked: {new Date(unlocked.date).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}


export const Achievements: React.FC<AchievementsProps> = ({ unlockedAchievements }) => {
  const unlockedMap = new Map(unlockedAchievements.map(a => [a.id, a]));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-text-primary">Your Achievements</h2>
        <p className="mt-2 text-lg text-text-secondary">Track your progress and celebrate your milestones as an AgriGuard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {ALL_ACHIEVEMENTS.map(ach => (
          <AchievementCard key={ach.id} achievement={ach} unlocked={unlockedMap.get(ach.id)} />
        ))}
      </div>
    </div>
  );
};