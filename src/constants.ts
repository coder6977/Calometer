import { ActivityLevel, FitnessGoal } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725
};

export const GOAL_OFFSETS: Record<FitnessGoal, number> = {
  weight_loss: -500,
  maintenance: 0,
  weight_gain: 300
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (Office job, little exercise)',
  lightly_active: 'Lightly Active (Light exercise 1-3 days/week)',
  moderately_active: 'Moderately Active (Moderate exercise 3-5 days/week)',
  very_active: 'Very Active (Hard exercise 6-7 days/week)'
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: 'Weight Loss',
  maintenance: 'Maintenance',
  weight_gain: 'Weight Gain'
};
