import { useState, useEffect } from 'react';
import { UserProfile, Tab, DayLog, Meal } from './types';
import { Navigation } from './components/Navigation';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { MealLogger } from './components/MealLogger';
import { HistoryView } from './components/HistoryView';
import { loadProfile, saveProfile, loadLogs, saveLogs, getTodayLog, addMealToLogs, removeMealFromLogs, updateWaterIntake } from './lib/storage';
import { calculateDailyGoal, calculateBMI } from './lib/calculations';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as any) || 'dark';
  });

  useEffect(() => {
    const loadedProfile = loadProfile();
    const loadedLogs = loadLogs();
    setProfile(loadedProfile);
    setLogs(loadedLogs);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    if (activeTab === 'profile') {
      setActiveTab('dashboard');
    }
  };

  const handleAddMeal = (meal: Meal) => {
    if (!profile) return;
    const dailyGoal = calculateDailyGoal(profile);
    const newLogs = addMealToLogs(logs, meal, dailyGoal);
    setLogs(newLogs);
    saveLogs(newLogs);
    setActiveTab('dashboard');
  };

  const handleRemoveMeal = (mealId: string) => {
    const newLogs = removeMealFromLogs(logs, mealId);
    setLogs(newLogs);
    saveLogs(newLogs);
  };

  const handleClearToday = () => {
    const today = calculateDailyGoal(profile!); // I need the current goal
    const newLogs = { ...logs };
    const todayStr = new Date().toISOString().split('T')[0];
    newLogs[todayStr] = {
      date: todayStr,
      meals: [],
      dailyGoal: dailyGoal,
      waterIntake: 0
    };
    setLogs(newLogs);
    saveLogs(newLogs);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleRemoveAvatar = () => {
    if (profile) {
      const newProfile = { ...profile };
      delete newProfile.avatar;
      setProfile(newProfile);
      saveProfile(newProfile);
    }
  };

  const handleUpdateWater = (amount: number) => {
    if (!profile) return;
    const dailyGoal = calculateDailyGoal(profile);
    const newLogs = updateWaterIntake(logs, amount, dailyGoal);
    setLogs(newLogs);
    saveLogs(newLogs);
  };

  if (!isLoaded) return null;

  if (!profile) {
    return (
      <div className="min-h-screen pb-10">
        <ProfileSetup onComplete={handleProfileComplete} />
      </div>
    );
  }

  const dailyGoal = calculateDailyGoal(profile);
  const todayLog = getTodayLog(logs, dailyGoal);
  const bmi = calculateBMI(profile.weight, profile.height);

  return (
    <div className="min-h-screen font-sans selection:bg-accent/30 selection:text-primary">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="md:ml-72 transition-all p-6 md:p-12 lg:p-16 max-w-[1440px]">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard 
                profile={profile} 
                todayLog={todayLog} 
                allLogs={logs}
                bmi={bmi} 
                onRemoveAvatar={handleRemoveAvatar}
                onUpdateWater={handleUpdateWater}
              />
            </motion.div>
          )}
          {activeTab === 'log' && (
            <motion.div
              key="log"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <MealLogger 
                todayLog={todayLog} 
                allLogs={logs}
                onAddMeal={handleAddMeal} 
                onRemoveMeal={handleRemoveMeal} 
                onClearToday={handleClearToday}
              />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryView logs={logs} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileSetup 
                initialProfile={profile} 
                onComplete={handleProfileComplete} 
                title="Profile Settings"
                buttonText="Update Profile"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
