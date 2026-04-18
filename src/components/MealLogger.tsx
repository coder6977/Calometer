import React, { useState } from 'react';
import { Meal, DayLog } from '../types';
import { Card, Button, Input } from './UI';
import { Trash2, Plus, Sparkles, Loader2, Coffee, Utensils, Moon, Apple, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { estimateMealCalories } from '../lib/gemini';

interface MealLoggerProps {
  todayLog: DayLog;
  allLogs: Record<string, DayLog>;
  onAddMeal: (meal: Meal) => void;
  onRemoveMeal: (mealId: string) => void;
  onClearToday: () => void;
}

type Step = 'type' | 'details' | 'confirm';

export const MealLogger: React.FC<MealLoggerProps> = ({ todayLog, allLogs, onAddMeal, onRemoveMeal, onClearToday }) => {
  const [step, setStep] = useState<Step>('type');
  const [name, setName] = useState('');
  const [portion, setPortion] = useState('');
  const [calories, setCalories] = useState('');
  const [type, setType] = useState<Meal['type']>('lunch');
  const [isEstimating, setIsEstimating] = useState(false);

  // Derive common meals from history
  const getCommonMeals = () => {
    const mealMap: Record<string, { meal: Partial<Meal>; count: number }> = {};
    Object.values(allLogs).forEach(log => {
      log.meals.forEach(meal => {
        const key = `${meal.name.split(' (')[0]}-${meal.calories}-${meal.type}`;
        if (mealMap[key]) {
          mealMap[key].count++;
        } else {
          mealMap[key] = { 
            meal: { 
              name: meal.name.split(' (')[0], 
              calories: meal.calories, 
              type: meal.type 
            }, 
            count: 1 
          };
        }
      });
    });

    const common = Object.values(mealMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.meal);

    // Fallback common foods if history is empty
    if (common.length === 0) {
      return [
        { name: 'Oatmeal', calories: 150, type: 'breakfast' as const },
        { name: 'Chicken Salad', calories: 350, type: 'lunch' as const },
        { name: 'Greek Yogurt', calories: 120, type: 'snack' as const },
        { name: 'Grilled Salmon', calories: 450, type: 'dinner' as const }
      ];
    }
    return common;
  };

  const commonMeals = getCommonMeals();

  const handleQuickAdd = (meal: Partial<Meal>) => {
    setName(meal.name || '');
    setCalories(meal.calories?.toString() || '');
    setType(meal.type || 'lunch');
    setPortion('');
    setStep('confirm');
  };

  const mealTypes: { id: Meal['type']; label: string; icon: any; color: string }[] = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
    { id: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
    { id: 'snack', label: 'Snack', icon: Apple, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
  ];

  const handleEstimate = async () => {
    if (!name || !portion) return;
    setIsEstimating(true);
    try {
      const estimated = await estimateMealCalories(name, portion);
      setCalories(estimated.toString());
    } catch (error) {
      console.error(error);
    } finally {
      setIsEstimating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPortion('');
    setCalories('');
    setStep('type');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name && calories) {
      const newMeal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        name: portion ? `${name} (${portion})` : name,
        calories: parseInt(calories),
        type,
        timestamp: Date.now()
      };
      onAddMeal(newMeal);
      resetForm();
    }
  };

  const canGoToDetails = type !== undefined;
  const canConfirm = name && portion && calories;

  return (
    <div className="space-y-10 pb-24 max-w-2xl mx-auto">
      <header className="text-center sm:text-left">
        <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] mb-2">Daily Food Log</h2>
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">What's the fuel?</h1>
        <p className="text-text-muted mt-2 font-medium italic">Track your intake with AI-powered calorie estimation.</p>
      </header>

      <Card className="overflow-hidden border-2 border-accent/20">
        <div className="relative">
          {/* Modern Step Progress */}
          <div className="px-8 pt-10 pb-2">
            <div className="flex justify-between relative">
              {/* Background Line */}
              <div className="absolute top-2 left-[10%] right-[10%] h-[2px] bg-accent/10 z-0" />
              
              {/* Progress Line */}
              <motion.div 
                className="absolute top-2 left-[10%] h-[2px] bg-secondary z-0"
                initial={{ width: '0%' }}
                animate={{ 
                  width: step === 'type' ? '0%' : step === 'details' ? '40%' : '80%' 
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />

              {[
                { id: 'type', label: 'Type' },
                { id: 'details', label: 'Details' },
                { id: 'confirm', label: 'Confirm' }
              ].map((s, idx) => {
                const isActive = step === s.id;
                const isCompleted = (step === 'details' && idx < 1) || (step === 'confirm' && idx < 2);
                
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center w-1/4">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: isActive ? 1.25 : 1,
                        backgroundColor: isCompleted || isActive ? 'var(--color-secondary)' : 'var(--color-bg)',
                        borderColor: isCompleted || isActive ? 'var(--color-secondary)' : 'var(--color-accent-20)',
                        boxShadow: isActive ? '0 0 15px var(--color-secondary-30)' : '0 0 0px transparent'
                      }}
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                    >
                      {isCompleted ? (
                        <Check size={10} className="text-white" strokeWidth={4} />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-accent/20'}`} />
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 transition-colors duration-300 ${isActive ? 'text-secondary' : 'text-text-muted/50'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'type' && (
                <motion.div 
                  key="step-type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-primary">Select meal type</h3>
                    <p className="text-sm text-text-muted">Start by telling us which part of the day it is.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {mealTypes.map((m) => {
                      const Icon = m.icon;
                      const isSelected = type === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setType(m.id);
                            setStep('details');
                          }}
                          className={`flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all active:scale-95 ${
                            isSelected 
                              ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/5' 
                              : 'border-accent/10 bg-bg/50 hover:border-accent/40'
                          }`}
                        >
                          <div className={`p-4 rounded-2xl mb-3 ${m.color}`}>
                            <Icon size={32} />
                          </div>
                          <span className={`font-black uppercase tracking-widest text-[10px] ${isSelected ? 'text-secondary' : 'text-text-muted'}`}>
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-10 border-t border-accent/10">
                    <div className="flex items-center justify-between mb-6 px-1">
                      <div>
                        <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-1">Favorites</h4>
                        <h3 className="text-lg font-black text-primary tracking-tight">Commonly Logged</h3>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/20"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/20"></div>
                      </div>
                    </div>
                    
                    <div className="relative group/carousel">
                      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
                        {commonMeals.map((meal, idx) => {
                          const typeInfo = mealTypes.find(t => t.id === meal.type) || mealTypes[1];
                          const TypeIcon = typeInfo.icon;
                          
                          return (
                            <motion.button
                              key={idx}
                              whileHover={{ y: -8, scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickAdd(meal)}
                              className="min-w-[160px] snap-center flex flex-col bg-surface border border-accent/10 rounded-[32px] p-5 text-left transition-all hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10 group/card relative overflow-hidden"
                            >
                              {/* Card Gloss Effect */}
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent -mr-12 -mt-12 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700" />
                              
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm z-10 ${typeInfo.color}`}>
                                <TypeIcon size={20} />
                              </div>
                              
                              <div className="mt-auto z-10">
                                <h5 className="text-sm font-black text-primary leading-tight line-clamp-2 group-hover/card:text-secondary transition-colors mb-1">
                                  {meal.name}
                                </h5>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{meal.calories} kcal</p>
                                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-2 group-hover/card:translate-x-0">
                                    <Plus size={14} />
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      {/* Gradient Faders */}
                      <div className="absolute top-0 bottom-6 left-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
                      <div className="absolute top-0 bottom-6 right-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div 
                  key="step-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <button onClick={() => setStep('type')} className="p-2 hover:bg-accent/10 rounded-full text-text-muted">
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-primary capitalize">{type} Details</h3>
                      <p className="text-sm text-text-muted">Describing your meal helps AI calculate calories.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Input 
                      label="Meal Name" 
                      placeholder="e.g. Avocado Toast" 
                      value={name}
                      autoFocus
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input 
                      label="Serving Size" 
                      placeholder="e.g. 2 slices, 250g, 1 bowl" 
                      value={portion}
                      onChange={(e) => setPortion(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-14"
                      onClick={() => setStep('type')}
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-[2] h-14"
                      disabled={!name || !portion}
                      onClick={() => setStep('confirm')}
                    >
                      Next Step <ChevronRight size={18} className="ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div 
                  key="step-confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <button onClick={() => setStep('details')} className="p-2 hover:bg-accent/10 rounded-full text-text-muted">
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-primary">Calorie Check</h3>
                      <p className="text-sm text-text-muted">Review and confirm the intake for this meal.</p>
                    </div>
                  </div>

                  <div className="bg-bg/60 p-6 rounded-3xl border border-accent/20 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-accent/10">
                      <div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Meal</div>
                        <div className="text-lg font-bold text-primary">{name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Portion</div>
                        <div className="text-sm font-bold text-primary">{portion}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                      <div className="flex-1 relative">
                        <motion.div
                          animate={isEstimating ? { 
                            boxShadow: [
                              "0 0 0px var(--color-secondary)",
                              "0 0 20px var(--color-secondary)",
                              "0 0 0px var(--color-secondary)"
                            ],
                            scale: [1, 1.01, 1]
                          } : {}}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="rounded-xl"
                        >
                          <Input 
                            label="Calories" 
                            type="number" 
                            min={0}
                            placeholder="kcal" 
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {isEstimating && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -top-6 left-0 flex items-center gap-2"
                            >
                              <span className="text-[10px] font-black text-secondary uppercase tracking-widest animate-pulse">
                                AI is estimating...
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        type="button"
                        onClick={handleEstimate}
                        disabled={isEstimating}
                        className="h-12 px-5 mt-7 bg-primary text-white rounded-2xl flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 min-w-[120px]"
                      >
                        {isEstimating ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Thinking...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-secondary" />
                            <span>AI Estimate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-14"
                      onClick={() => setStep('details')}
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-[2] h-14 bg-secondary border-none"
                      disabled={!calories}
                      onClick={() => handleSubmit()}
                    >
                      <Check size={20} className="mr-2" /> Finish & Log
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tight">Today's Timeline</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Review your intake</p>
          </div>
          <div className="flex items-center gap-3">
            {todayLog.meals.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm("Reset today's data? This will clear all logs and water intake for today.")) {
                    onClearToday();
                  }
                }}
                className="text-[10px] font-black text-error uppercase tracking-widest px-4 py-2 hover:bg-error/5 rounded-full border border-error/10 transition-colors"
                title="Reset Today"
              >
                Clear All
              </button>
            )}
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] bg-accent/20 px-4 py-2 rounded-full">
              {todayLog.meals.length} Items
            </span>
          </div>
        </div>

        {todayLog.meals.length > 0 ? (
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-accent/20">
            <AnimatePresence initial={false}>
              {todayLog.meals.slice().reverse().map((meal) => {
                const typeInfo = mealTypes.find(t => t.id === meal.type) || mealTypes[1];
                const TypeIcon = typeInfo.icon;
                
                return (
                  <motion.div 
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[30px] top-4 w-6 h-6 rounded-full border-4 border-bg flex items-center justify-center z-10 ${typeInfo.color.split(' ')[1]}`}>
                      <TypeIcon size={12} className={typeInfo.color.split(' ')[0]} />
                    </div>

                    <div className="bg-surface p-6 rounded-[32px] border border-accent/10 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
                          {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h4 className="font-bold text-primary text-lg leading-tight">{meal.name}</h4>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${typeInfo.color}`}>
                            {meal.type}
                          </span>
                          <span className="text-sm font-black text-primary">{meal.calories} kcal</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm(`Remove "${meal.name}" from your log?`)) {
                            onRemoveMeal(meal.id);
                          }
                        }}
                        className="p-3 text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted/40 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-accent/20 rounded-[40px]">
            Ready to log your first meal?
          </div>
        )}
      </div>
    </div>
  );
};
