import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { History } from "./components/History";
import { Chatbot } from "./components/Chatbot";
import { FieldHeatmap } from "./components/FieldHeatmap";
import { Resources } from "./components/Resources";
import { Profile } from "./components/Profile";
import { Achievements } from "./components/Achievements";
import { AchievementToast } from "./components/AchievementToast";
import type {
  HistoryEntry,
  PurchaseLog,
  PlayerStats,
  UserSettings,
  UnlockedAchievement,
  Achievement,
  PesticideRating,
  UserData,
} from "./types";
import { getAllUsers, saveUser, deleteUser } from "./services/userService";
import { checkAchievements } from "./services/achievements";
import { soundService } from "./services/soundService";
import {
  getPesticideRatings,
  savePesticideRatings,
} from "./services/pesticideService";

type View =
  | "dashboard"
  | "history"
  | "field"
  | "resources"
  | "profile"
  | "achievements";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000]; // Points needed for each level
const LEVEL_NAMES = [
  "Seedling",
  "Sprout",
  "Green Thumb",
  "Crop Master",
  "AgriGuard",
];
const SAVINGS_MULTIPLIER = 1;

const areStatsEqual = (a: PlayerStats, b: PlayerStats): boolean => {
  if (!a || !b) return false;
  return (
    a.score === b.score &&
    a.scans === b.scans &&
    a.level === b.level &&
    a.levelName === b.levelName &&
    a.progress === b.progress &&
    a.totalSavings === b.totalSavings &&
    a.unlockedAchievements === b.unlockedAchievements
  );
};

const App: React.FC<{ username: string; onLogout: () => void }> = ({
  username,
  onLogout,
}) => {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    score: 0,
    scans: 0,
    level: 1,
    levelName: LEVEL_NAMES[0],
    progress: 0,
    totalSavings: 0,
    unlockedAchievements: 0,
  });
  const [settings, setSettings] = useState<UserSettings>({
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
    isSoundEnabled: true,
    profilePicture: undefined,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [pesticideRatings, setPesticideRatings] = useState<
    Record<string, PesticideRating>
  >({});

  const calculatePlayerStats = useCallback(
    (
      currentHistory: HistoryEntry[],
      currentPurchaseLogs: PurchaseLog[],
      currentUnlockedAchievements: UnlockedAchievement[]
    ): PlayerStats => {
      const scoreFromScans = currentHistory.reduce((sum, entry) => {
        const scoreChange = Math.round(25 - entry.result.infectionLevel / 2);
        return sum + scoreChange;
      }, 0);

      const scoreFromPurchases = currentPurchaseLogs.reduce((sum, log) => {
        const pointsDeducted = Math.round(log.cost / 2);
        return sum + pointsDeducted;
      }, 0);

      const totalScore = scoreFromScans - scoreFromPurchases;
      const finalScore = Math.max(0, totalScore);
      const scans = currentHistory.length;

      let level = 1;
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (finalScore >= LEVEL_THRESHOLDS[i]) {
          level = i + 1;
          break;
        }
      }
      level = Math.min(level, LEVEL_NAMES.length);

      const currentLevelScore = LEVEL_THRESHOLDS[level - 1];
      const nextLevelScore = LEVEL_THRESHOLDS[level] ?? finalScore;
      const scoreInLevel = finalScore - currentLevelScore;
      const scoreToNextLevel = nextLevelScore - currentLevelScore;

      const progress =
        scoreToNextLevel > 0
          ? Math.round((scoreInLevel / scoreToNextLevel) * 100)
          : 100;

      const totalSavings = currentHistory.reduce((sum, entry) => {
        const savings =
          Math.round((100 - entry.result.infectionLevel) / 10) *
          SAVINGS_MULTIPLIER;
        return sum + savings;
      }, 0);

      return {
        score: finalScore,
        scans,
        level,
        levelName: LEVEL_NAMES[level - 1],
        progress: Math.min(100, progress),
        totalSavings,
        unlockedAchievements: currentUnlockedAchievements.length,
      };
    },
    []
  );

  const saveCurrentUserData = useCallback(() => {
    const users = getAllUsers();
    if (users[username]) {
      const currentUserData: UserData = {
        history,
        purchaseLogs,
        stats: { score: playerStats.score, scans: playerStats.scans },
        settings,
        unlockedAchievements,
      };
      saveUser(username, { ...users[username], data: currentUserData });
    }
  }, [
    username,
    history,
    purchaseLogs,
    playerStats,
    settings,
    unlockedAchievements,
  ]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    soundService.setSoundEnabled(settings.isSoundEnabled ?? true);
  }, [settings.theme, settings.isSoundEnabled]);

  useEffect(() => {
    let initialized = false;
    const initializeAudio = () => {
      if (initialized) return;
      initialized = true;
      soundService.init();
      window.removeEventListener("click", initializeAudio);
      window.removeEventListener("keydown", initializeAudio);
    };

    window.addEventListener("click", initializeAudio);
    window.addEventListener("keydown", initializeAudio);

    return () => {
      window.removeEventListener("click", initializeAudio);
      window.removeEventListener("keydown", initializeAudio);
    };
  }, []);

  useEffect(() => {
    try {
      const users = getAllUsers();
      const userData = users[username]?.data;
      const ratings = getPesticideRatings();
      setPesticideRatings(ratings);

      if (userData) {
        const loadedHistory = userData.history || [];
        const loadedPurchases = userData.purchaseLogs || [];
        const loadedAchievements = userData.unlockedAchievements || [];
        const defaultSettings: UserSettings = {
          theme: window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
          isSoundEnabled: true,
          profilePicture: undefined,
        };

        setHistory(loadedHistory);
        setPurchaseLogs(loadedPurchases);
        setUnlockedAchievements(loadedAchievements);
        setSettings({ ...defaultSettings, ...userData.settings });
        setPlayerStats(
          calculatePlayerStats(
            loadedHistory,
            loadedPurchases,
            loadedAchievements
          )
        );
      }
    } catch (error) {
      console.error("Failed to load user data from local storage:", error);
    }
  }, [username, calculatePlayerStats]);

  useEffect(() => {
    saveCurrentUserData();
  }, [
    history,
    purchaseLogs,
    playerStats,
    settings,
    unlockedAchievements,
    saveCurrentUserData,
  ]);

  const currentPlayerData = useMemo(
    (): UserData => ({
      history,
      purchaseLogs,
      stats: playerStats,
      settings,
      unlockedAchievements,
    }),
    [history, purchaseLogs, playerStats, settings, unlockedAchievements]
  );

  useEffect(() => {
    const newPlayerStats = calculatePlayerStats(
      history,
      purchaseLogs,
      unlockedAchievements
    );

    const newlyUnlocked = checkAchievements(currentPlayerData, newPlayerStats);

    if (newlyUnlocked.length > 0) {
      soundService.play("achievementUnlocked");
      setToastQueue((prev) => [...prev, ...newlyUnlocked]);
      setUnlockedAchievements((prev) => [
        ...prev,
        ...newlyUnlocked.map((ach) => ({
          id: ach.id,
          date: new Date().toISOString(),
        })),
      ]);
    }

    if (!areStatsEqual(playerStats, newPlayerStats)) {
      setPlayerStats(newPlayerStats);
    }
  }, [
    history,
    purchaseLogs,
    unlockedAchievements,
    calculatePlayerStats,
    currentPlayerData,
    playerStats,
  ]);

  const handleNewScan = (newScan: HistoryEntry) => {
    setHistory([newScan, ...history]);
  };

  const handleDeleteHistory = (id: string) => {
    soundService.play("delete");
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const handleLogPurchase = (
    purchaseData: Omit<PurchaseLog, "id" | "date">
  ) => {
    soundService.play("purchase");
    const newPurchase: PurchaseLog = {
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
      ...purchaseData,
    };
    setPurchaseLogs([newPurchase, ...purchaseLogs]);
  };

  const handleDeletePurchase = (id: string) => {
    soundService.play("delete");
    setPurchaseLogs(purchaseLogs.filter((log) => log.id !== id));
  };

  const handleRatePurchase = (purchaseId: string, rating: number) => {
    soundService.play("rate");
    const logToRate = purchaseLogs.find((log) => log.id === purchaseId);
    if (!logToRate || logToRate.rating) return;

    const updatedLogs = purchaseLogs.map((log) =>
      log.id === purchaseId ? { ...log, rating } : log
    );
    setPurchaseLogs(updatedLogs);

    const { pesticideName } = logToRate;
    const updatedRatings = { ...pesticideRatings };
    const currentRating = updatedRatings[pesticideName] || {
      totalScore: 0,
      count: 0,
    };

    updatedRatings[pesticideName] = {
      totalScore: currentRating.totalScore + rating,
      count: currentRating.count + 1,
    };

    setPesticideRatings(updatedRatings);
    savePesticideRatings(updatedRatings);
  };

  const handleChatToggle = () => setIsChatOpen((prev) => !prev);
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) =>
    setSettings((prev) => ({ ...prev, ...newSettings }));

  const handleChangePassword = (newPassword: string): Promise<void> => {
    return new Promise((resolve) => {
      const users = getAllUsers();
      const currentUser = users[username];
      if (currentUser) {
        saveUser(username, { ...currentUser, password: newPassword });
      }
      resolve();
    });
  };

  const handleDeleteAccount = () => {
    deleteUser(username);
    onLogout();
  };

  const getFullUserData = () => ({
    username,
    data: { history, purchaseLogs, playerStats, settings },
  });

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            onNewScan={handleNewScan}
            setCurrentView={setCurrentView}
            playerStats={playerStats}
            onLogPurchase={handleLogPurchase}
          />
        );
      case "history":
        return (
          <History
            history={history}
            purchaseLogs={purchaseLogs}
            onDeleteHistory={handleDeleteHistory}
            onDeletePurchase={handleDeletePurchase}
            onRatePurchase={handleRatePurchase}
          />
        );
      case "field":
        return <FieldHeatmap history={history} />;
      case "achievements":
        return <Achievements unlockedAchievements={unlockedAchievements} />;
      case "resources":
        return (
          <Resources
            purchaseLogs={purchaseLogs}
            onLogPurchase={handleLogPurchase}
            onDeletePurchase={handleDeletePurchase}
            pesticideRatings={pesticideRatings}
            onRatePurchase={handleRatePurchase}
          />
        );
      case "profile":
        return (
          <Profile
            username={username}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
            onExportData={getFullUserData}
          />
        );
      default:
        return (
          <Dashboard
            onNewScan={handleNewScan}
            setCurrentView={setCurrentView}
            playerStats={playerStats}
            onLogPurchase={handleLogPurchase}
          />
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-text-primary transition-colors duration-300">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onChatToggle={handleChatToggle}
        username={username}
        onLogout={onLogout}
        settings={settings}
      />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {toastQueue.length > 0 && (
        <AchievementToast
          key={toastQueue[0].id}
          achievement={toastQueue[0]}
          onDismiss={() => setToastQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
};

export default App;
