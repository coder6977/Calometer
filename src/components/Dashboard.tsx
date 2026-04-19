import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from './UI';
import { UserProfile, DayLog } from '../types';
import { Sparkles, Loader2, ArrowRight, Plus, Info, User as UserIcon, UtensilsCrossed, Flame, Trash2, Droplets, Minus } from 'lucide-react';
import { getDietarySuggestions, getSpecificMealSuggestions } from '../lib/gemini';
import { getBMIStatus, calculateStreak } from '../lib/calculations';
import Markdown from 'react-markdown';

interface DashboardProps {
  profile: UserProfile;
  todayLog: DayLog;
  allLogs: Record<string, DayLog>;
  bmi: number;
  onRemoveAvatar: () => void;
  onUpdateWater: (amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  profile, 
  todayLog, 
  allLogs, 
  bmi, 
  onRemoveAvatar,
  onUpdateWater 
}) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [mealSuggestions, setMealSuggestions] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Simulate initial data loading for "Health Analytics" section
  React.useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const totalConsumed = todayLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remaining = Math.max(0, todayLog.dailyGoal - totalConsumed);
  const progress = Math.min(100, (totalConsumed / todayLog.dailyGoal) * 100);
  const isOverGoal = totalConsumed > todayLog.dailyGoal;
  const bmiInfo = getBMIStatus(bmi);
  const streak = calculateStreak(allLogs);

  const handleGetAiSuggestions = async () => {
    setIsLoadingAi(true);
    const suggestions = await getDietarySuggestions(profile, todayLog.dailyGoal, remaining, todayLog.meals);
    setAiResponse(suggestions);
    setIsLoadingAi(false);
  };

  const handleGetMealSuggestions = async () => {
    setIsLoadingSuggestions(true);
    const suggestions = await getSpecificMealSuggestions(profile, remaining);
    setMealSuggestions(suggestions);
    setIsLoadingSuggestions(false);
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="flex justify-between items-start gap-6 border-b border-accent/10 pb-8 sm:pb-10">
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-[10px] sm:text-xs font-black text-secondary uppercase tracking-[0.25em] mb-2">Daily Performance</h2>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-none truncate pb-1">
              Hello, {profile.name.split(' ')[0]}!
            </h1>
            <p className="text-text-muted mt-2 font-medium text-sm sm:text-base md:text-lg leading-tight">
              You've hit <span className="text-primary font-black">{Math.round(progress)}%</span> of your calorie goal today.
            </p>
            {streak > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center gap-2 bg-secondary/10 w-fit px-4 py-2 rounded-2xl border border-secondary/20"
              >
                <Flame size={18} className="text-secondary fill-secondary" />
                <span className="text-sm font-black text-secondary tracking-tight">
                  {streak} Day {streak === 1 ? 'Streak' : 'Streaks'}!
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Keeping it real</span>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-end shrink-0"
        >
          {profile.avatar ? (
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[28px] sm:rounded-[36px] overflow-hidden border-[3px] border-accent shadow-xl shadow-accent/20 ring-4 ring-bg transition-transform hover:scale-105 duration-300 relative bg-surface">
                <AnimatePresence>
                  {isAvatarLoading && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 bg-surface"
                    >
                      <Loader2 className="animate-spin text-accent/40" size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isAvatarLoading ? 'opacity-0' : 'opacity-100'}`} 
                  onLoad={() => setIsAvatarLoading(false)}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Remove profile photo?")) {
                      onRemoveAvatar();
                    }
                  }}
                  className="absolute inset-0 bg-error/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                >
                  <Trash2 size={24} className="text-white" />
                </button>
              </div>
              {/* Active Badge */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-secondary border-[3px] border-bg rounded-full shadow-lg z-30" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[28px] sm:rounded-[36px] bg-surface flex items-center justify-center border-[3px] border-accent/20 ring-4 ring-bg">
              <UserIcon className="text-text-muted/40" size={28} />
            </div>
          )}
          
          <div className="text-right hidden sm:block mt-4">
            <p className="font-bold text-primary text-[10px] md:text-xs leading-none uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</p>
            <p className="text-xl md:text-2xl font-black text-primary leading-tight mt-0.5">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          <section className="bg-surface rounded-[40px] p-10 flex flex-col items-center">
            <div className="relative w-64 h-80 bg-accent/5 rounded-[48px] border-4 border-accent/20 overflow-hidden shadow-inner group/reservoir">
              {/* Dynamic Liquid Fill */}
              <motion.div
                className={`absolute bottom-0 left-0 right-0 ${isOverGoal ? 'bg-gradient-to-t from-error to-error/60' : 'bg-gradient-to-t from-secondary to-secondary/60'}`}
                initial={{ height: '0%' }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 2, ease: "circOut" }}
              >
                {/* Wave Animations */}
                <motion.div
                  className="absolute -top-12 left-[-50%] w-[200%] h-24 bg-white/20 rounded-[45%] opacity-40"
                  animate={{ 
                    rotate: 360,
                    x: [0, 20, 0]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                    x: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                  }}
                />
                <motion.div
                  className="absolute -top-14 left-[-40%] w-[200%] h-24 bg-white/10 rounded-[42%] opacity-30"
                  animate={{ 
                    rotate: -360,
                    x: [0, -20, 0]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 12, ease: "linear" },
                    x: { repeat: Infinity, duration: 6, ease: "easeInOut" }
                  }}
                />
              </motion.div>
              
              {/* Stats Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] block mb-1">Remaining Intake</span>
                  <span className="text-6xl font-black text-primary tracking-tighter block leading-none">
                    {remaining}
                  </span>
                  <span className="text-xs font-black text-primary/30 uppercase tracking-[0.3em] block mt-2">kilocalories</span>
                </motion.div>
              </div>

              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              <div className="absolute top-8 left-8 w-4 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            </div>

            <div className="mt-10 w-full grid grid-cols-2 gap-4">
              <div className="bg-bg/40 p-5 rounded-3xl text-center border border-accent/20">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1 text-center">Consumed</span>
                <span className="text-2xl font-black text-primary">{totalConsumed}</span>
              </div>
              <div className="bg-bg/40 p-5 rounded-3xl text-center border border-accent/20">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1 text-center">Daily Goal</span>
                <span className="text-2xl font-black text-primary">{todayLog.dailyGoal}</span>
              </div>
            </div>
          </section>

          <section className="bg-surface rounded-[40px] p-8 border border-accent/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl">
                  <Droplets className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary tracking-tight">Water Intake</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Hydration is key</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-primary">{(todayLog.waterIntake / 1000).toFixed(1)}</span>
                <span className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Liters</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: 8 }).map((_, i) => {
                  const isFilled = todayLog.waterIntake >= (i + 1) * 250;
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{ 
                        scale: isFilled ? 1 : 0.9,
                        opacity: isFilled ? 1 : 0.3
                      }}
                      className={`min-w-[32px] h-10 rounded-lg flex items-end justify-center pb-1 border-b-4 ${
                        isFilled ? 'bg-blue-500/20 border-blue-500' : 'bg-accent/5 border-accent/20'
                      }`}
                    >
                      <div className={`w-4 h-full rounded-t-sm transition-all duration-500 ${isFilled ? 'bg-blue-400' : 'bg-transparent'}`} />
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => onUpdateWater(-250)}
                  disabled={todayLog.waterIntake <= 0}
                  className="w-12 h-12 rounded-2xl bg-bg border border-accent/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-accent transition-all active:scale-95 disabled:opacity-20"
                >
                  <Minus size={20} />
                </button>
                <button
                  onClick={() => onUpdateWater(250)}
                  className="flex-1 h-12 rounded-2xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  Add Glass
                </button>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black text-primary tracking-tight">Recent Entries</h3>
              <Button onClick={() => window.location.hash = '#log'} className="w-10 h-10 p-0 flex items-center justify-center rounded-full">
                <Plus size={24} />
              </Button>
            </div>
            
            {todayLog.meals.length > 0 ? (
              <div className="space-y-4">
                {todayLog.meals.slice(-3).reverse().map((meal) => (
                  <div key={meal.id} className="group bg-bg p-5 rounded-[24px] border border-accent/20 flex justify-between items-center hover:px-6 transition-all shadow-sm">
                    <div>
                      <h4 className="font-bold text-primary text-lg">{meal.name}</h4>
                      <p className="text-xs font-black text-text-muted uppercase tracking-[0.15em] mt-1">{meal.type} • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary">{meal.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-text-muted/40 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-accent/20 rounded-[32px]">
                No meals logged today
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] p-8 rounded-[32px] text-white shadow-xl shadow-primary/20"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">AI Coach</h3>
            {isLoadingAi ? (
              <div className="flex justify-center py-4">
                <Loader2 size={32} className="animate-spin opacity-50" />
              </div>
            ) : (
              <p className="text-lg font-medium leading-relaxed italic opacity-95">
                {aiResponse || "\"Tap below to get personalized dietary advice based on your today's log.\""}
              </p>
            )}
            <button 
              onClick={handleGetAiSuggestions}
              disabled={isLoadingAi}
              className="mt-8 bg-secondary text-white w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoadingAi ? 'Consulting...' : 'Get Advice'}
            </button>
          </motion.div>

          <div className="bg-surface rounded-[32px] p-8 border border-accent/20">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
              <Info size={16} />
              Health Analytics
            </h3>
            
            {isDataLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-accent/10 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-accent/20">
                  <span className="text-xs font-bold text-text-muted uppercase">BMI Score</span>
                  <span className="font-black text-primary text-xl tracking-tighter">{bmi}</span>
                </div>
                <div className="pb-4 border-b border-accent/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-text-muted uppercase">Status</span>
                    <span className="font-black text-sm px-3 py-0.5 rounded-full" style={{ backgroundColor: `${bmiInfo.color}33`, color: bmiInfo.color }}>
                      {bmiInfo.label}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-text-muted font-medium italic mt-2 opacity-80">
                    {bmiInfo.advice}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-muted uppercase">Target Weight</span>
                  <span className="font-black text-secondary">
                    {profile.targetWeight ? `${profile.targetWeight} kg` : 'Not Set'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 rounded-[32px] p-8 border border-accent/30"
          >
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-secondary" />
              Meal Suggestions
            </h3>
            
            {isLoadingSuggestions ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-accent/20 rounded-full w-3/4 animate-pulse" />
                <div className="h-4 bg-accent/20 rounded-full w-1/2 animate-pulse" />
                <div className="h-4 bg-accent/20 rounded-full w-2/3 animate-pulse" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert prose-p:text-text-muted prose-p:italic max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {mealSuggestions ? (
                  <Markdown>{mealSuggestions}</Markdown>
                ) : (
                  <p className="text-xs font-medium italic opacity-70">
                    Need ideas for your next {remaining} kcal? Tap below for AI ideas.
                  </p>
                )}
              </div>
            )}
            
            <button 
              onClick={handleGetMealSuggestions}
              disabled={isLoadingSuggestions}
              className="mt-6 w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingSuggestions ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Suggest Meals</span>
                </>
              )}
            </button>
          </motion.div>
        </aside>
      </div>
    </div>
  );
};
