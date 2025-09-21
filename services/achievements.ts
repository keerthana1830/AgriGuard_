import type { Achievement, UserData, PlayerStats } from '../types';
import { LeafIcon, TrophyIcon, BugAntIcon, CurrencyDollarIcon, MoonIcon, PlusCircleIcon, SparklesIcon } from '../components/Icons';

export const ALL_ACHIEVEMENTS: readonly Achievement[] = [
    { id: 'first_scan', name: 'First Scan', description: 'Complete your first plant analysis.', icon: LeafIcon },
    { id: 'ten_scans', name: 'Novice Analyst', description: 'Scan 10 different plants.', icon: SparklesIcon },
    { id: 'healthy_check', name: 'Green Bill of Health', description: 'Scan a plant with less than 5% infection.', icon: LeafIcon },
    { id: 'pest_buster', name: 'Pest Buster', description: 'Successfully identify your first pest.', icon: BugAntIcon },
    { id: 'high_infection', name: 'Critical Care', description: 'Analyze a plant with over 75% infection.', icon: BugAntIcon },
    { id: 'first_purchase', name: 'First Investment', description: 'Log your first pesticide purchase.', icon: PlusCircleIcon },
    { id: 'economist', name: 'Economist', description: 'Achieve total estimated savings of over $100.', icon: CurrencyDollarIcon },
    { id: 'rank_sprout', name: 'Sprout', description: 'Reach level 2.', icon: TrophyIcon },
    { id: 'rank_master', name: 'Crop Master', description: 'Reach level 4.', icon: TrophyIcon },
    { id: 'night_owl', name: 'Night Owl', description: 'Scan a plant between 10 PM and 4 AM.', icon: MoonIcon },
] as const;


export const checkAchievements = (
    userData: UserData,
    playerStats: PlayerStats,
): Achievement[] => {
    const unlockedIds = new Set(userData.unlockedAchievements.map(a => a.id));
    const newAchievements: Achievement[] = [];

    const checkAndAdd = (achievement: Achievement) => {
        if (!unlockedIds.has(achievement.id)) {
            newAchievements.push(achievement);
            unlockedIds.add(achievement.id); // Prevent duplicate adds in same check
        }
    };

    // Scan-based achievements
    if (userData.history.length >= 1) {
        checkAndAdd(ALL_ACHIEVEMENTS[0]); // First Scan
    }
    if (userData.history.length >= 10) {
        checkAndAdd(ALL_ACHIEVEMENTS[1]); // Ten Scans
    }
    if (userData.history.some(h => h.result.infectionLevel < 5)) {
        checkAndAdd(ALL_ACHIEVEMENTS[2]); // Healthy Check
    }
    if (userData.history.some(h => h.result.pestName.toLowerCase() !== 'none')) {
        checkAndAdd(ALL_ACHIEVEMENTS[3]); // Pest Buster
    }
    if (userData.history.some(h => h.result.infectionLevel > 75)) {
        checkAndAdd(ALL_ACHIEVEMENTS[4]); // High Infection
    }
     if (userData.history.some(h => {
        const hour = new Date(h.date).getHours();
        return hour >= 22 || hour < 4;
     })) {
        checkAndAdd(ALL_ACHIEVEMENTS[9]); // Night Owl
    }

    // Purchase-based achievements
    if (userData.purchaseLogs.length >= 1) {
        checkAndAdd(ALL_ACHIEVEMENTS[5]); // First Purchase
    }

    // Stat-based achievements
    if (playerStats.totalSavings > 100) {
        checkAndAdd(ALL_ACHIEVEMENTS[6]); // Economist
    }
    if (playerStats.level >= 2) {
        checkAndAdd(ALL_ACHIEVEMENTS[7]); // Rank Sprout
    }
    if (playerStats.level >= 4) {
        checkAndAdd(ALL_ACHIEVEMENTS[8]); // Rank Master
    }

    return newAchievements;
};