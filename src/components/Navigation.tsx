import React from 'react';
import { LayoutDashboard, PlusCircle, History, User, Moon, Sun } from 'lucide-react';

export type Tab = 'dashboard' | 'log' | 'history' | 'profile';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, theme, onToggleTheme }) => {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'log', label: 'Meal Logger', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-surface border-r border-accent/30 flex-col p-10 justify-between z-50 transition-colors duration-300">
        <div className="space-y-12">
          <div className="flex justify-between items-center mb-10">
            <div className="text-3xl font-black text-primary tracking-tighter uppercase">CaloMeter.</div>
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-accent/20 text-primary hover:bg-accent/40 transition-all"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} className="fill-current" /> : <Sun size={20} />}
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-4 transition-all group ${
                    isActive ? 'text-primary font-bold' : 'text-text-muted hover:text-primary font-medium'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-secondary' : 'bg-transparent group-hover:bg-accent/30'}`} />
                  <span className="text-lg tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-primary p-6 rounded-[24px] text-white dark:text-bg space-y-2 shadow-lg shadow-primary/10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Today's Session</h4>
          <p className="text-lg font-black tracking-tight leading-none">Healthy Living</p>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-accent border-t border-accent/20 px-6 py-4 flex justify-between items-center z-50 safe-area-bottom shadow-2xl transition-colors duration-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted/40 hover:text-text-muted'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.id === 'log' ? 'Log' : tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button 
          onClick={onToggleTheme}
          className="flex flex-col items-center space-y-1 text-text-muted/40"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Theme</span>
        </button>
      </nav>
    </>
  );
};
