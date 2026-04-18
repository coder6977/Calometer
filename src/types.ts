export type Tab = 'dashboard' | 'log' | 'history' | 'profile';

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  targetWeight?: number;
  customDailyGoal?: number;
  avatar?: string;
}

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export type FitnessGoal = 'weight_loss' | 'maintenance' | 'weight_gain';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  dailyGoal: number;
  waterIntake: number;
}
