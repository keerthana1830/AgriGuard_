import type { FC, SVGProps } from 'react';

export interface ScanResult {
  pestName: string;
  infectionLevel: number;
  recommendation: string;
  reasoning: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  image: string; // base64 data URL
  result: ScanResult;
  location?: string; // e.g., 'A1', 'B5'
  weather?: {
    temp: number; // in Celsius
    condition: string;
    icon: 'sun' | 'cloud' | 'rain';
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PlayerStats {
  score: number;
  scans: number;
  level: number;
  levelName: string;
  progress: number; // percentage to next level
  totalSavings: number;
  unlockedAchievements: number;
}

export interface PurchaseLog {
  id: string;
  date: string;
  pesticideName: string;
  cost: number;
  quantity: number;
  unit: 'liter' | 'kg';
  rating?: number; // 1-5 star rating
}

export interface UserSettings {
  theme: 'light' | 'dark';
  isSoundEnabled: boolean;
  profilePicture?: string; // base64 data URL
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}

export interface UnlockedAchievement {
  id: string;
  date: string;
}

export interface UserData {
  history: HistoryEntry[];
  purchaseLogs: PurchaseLog[];
  stats: {
    score: number;
    scans: number;
  };
  settings: UserSettings;
  unlockedAchievements: UnlockedAchievement[];
}

export interface User {
  password: string; // In a real app, this would be a hash
  data: UserData;
}

export interface Pesticide {
  name: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  unit: 'per liter' | 'per kg';
}

export interface PesticideRating {
  totalScore: number;
  count: number;
}