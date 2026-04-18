import { UserProfile, DayLog, Meal } from '../types';
import { getTodayDateString } from './calculations';

const STORAGE_KEYS = {
  PROFILE: 'vitaltrack_profile',
  LOGS: 'vitaltrack_logs'
};

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile to localStorage:', error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Local storage is full. Please try a smaller image or clearing some data.');
    }
  }
}

export function loadProfile(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export function saveLogs(logs: Record<string, DayLog>): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

export function loadLogs(): Record<string, DayLog> {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : {};
}

export function getTodayLog(logs: Record<string, DayLog>, dailyGoal: number): DayLog {
  const today = getTodayDateString();
  if (logs[today]) {
    // Sync daily goal if it changed in profile
    return { 
      ...logs[today], 
      dailyGoal,
      waterIntake: logs[today].waterIntake || 0 
    };
  }
  return {
    date: today,
    meals: [],
    dailyGoal,
    waterIntake: 0
  };
}

export function updateWaterIntake(logs: Record<string, DayLog>, amount: number, dailyGoal: number): Record<string, DayLog> {
  const today = getTodayDateString();
  const currentLog = getTodayLog(logs, dailyGoal);
  const updatedLog = {
    ...currentLog,
    waterIntake: Math.max(0, currentLog.waterIntake + amount)
  };
  return {
    ...logs,
    [today]: updatedLog
  };
}

export function addMealToLogs(logs: Record<string, DayLog>, meal: Meal, dailyGoal: number): Record<string, DayLog> {
  const today = getTodayDateString();
  const currentLog = getTodayLog(logs, dailyGoal);
  const updatedLog = {
    ...currentLog,
    meals: [...currentLog.meals, meal]
  };
  return {
    ...logs,
    [today]: updatedLog
  };
}

export function removeMealFromLogs(logs: Record<string, DayLog>, mealId: string): Record<string, DayLog> {
  const today = getTodayDateString();
  if (!logs[today]) return logs;
  
  const updatedMeals = logs[today].meals.filter(m => m.id !== mealId);
  return {
    ...logs,
    [today]: {
      ...logs[today],
      meals: updatedMeals
    }
  };
}
