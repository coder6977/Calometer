import { UserProfile } from '../types';
import { ACTIVITY_MULTIPLIERS, GOAL_OFFSETS } from '../constants';

export function calculateBMR(profile: UserProfile): number {
  if (profile.gender === 'male') {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
  } else {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateDailyGoal(profile: UserProfile): number {
  if (profile.customDailyGoal) {
    return profile.customDailyGoal;
  }
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  return Math.round(tdee + GOAL_OFFSETS[profile.goal]);
}

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function getBMIStatus(bmi: number): { label: string; color: string; advice: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', advice: 'Consider increasing your calorie intake with nutrient-dense foods.' };
  if (bmi < 25) return { label: 'Normal', color: '#52b788', advice: 'Great job! Maintain your current healthy habits.' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', advice: 'Your BMI is high. Focus on consistent exercise and a balanced diet.' };
  return { label: 'Obese', color: '#e63946', advice: 'Your BMI is in the obese range. Consult a professional to help reduce it safely.' };
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateStreak(logs: Record<string, any>): number {
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  
  const getConsumed = (dateStr: string) => {
    const log = logs[dateStr];
    if (!log || log.meals.length === 0) return null;
    return log.meals.reduce((sum: number, m: any) => sum + m.calories, 0);
  };

  const todayStr = today.toISOString().split('T')[0];
  const todayConsumed = getConsumed(todayStr);
  const todayMet = todayConsumed !== null && todayConsumed <= (logs[todayStr]?.dailyGoal || 0);

  // If we met today, or haven't finished today but met yesterday, the streak is alive
  let startDate = today;
  if (!todayMet) {
    // Check if we met yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayConsumed = getConsumed(yesterdayStr);
    const yesterdayMet = yesterdayConsumed !== null && yesterdayConsumed <= (logs[yesterdayStr]?.dailyGoal || 0);
    
    if (!yesterdayMet) return 0;
    startDate = yesterday;
  }

  checkDate = new Date(startDate);
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const consumed = getConsumed(dateStr);
    const goal = logs[dateStr]?.dailyGoal;

    if (consumed !== null && goal !== undefined && consumed <= goal) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
