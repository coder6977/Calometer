import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DayLog } from '../types';
import { Card, Button } from './UI';
import { Download } from 'lucide-react';

interface HistoryViewProps {
  logs: Record<string, DayLog>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ logs }) => {
  const handleExportCSV = () => {
    const headers = ['Date', 'Daily Goal (kcal)', 'Water Intake (ml)', 'Meal Name', 'Calories (kcal)', 'Type', 'Time'];
    const rows: string[][] = [];

    // Sort dates to have a chronological CSV
    const sortedDates = Object.keys(logs).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach(date => {
      const log = logs[date];
      if (log.meals.length === 0) {
        rows.push([date, log.dailyGoal.toString(), (log.waterIntake || 0).toString(), 'No meals', '0', '-', '-']);
      } else {
        log.meals.forEach(meal => {
          rows.push([
            date,
            log.dailyGoal.toString(),
            (log.waterIntake || 0).toString(),
            meal.name.replace(/,/g, ''), // Basic CSV escaping
            meal.calories.toString(),
            meal.type,
            new Date(meal.timestamp).toLocaleTimeString()
          ]);
        });
      }
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `calometer_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    const total = log ? log.meals.reduce((sum, m) => sum + m.calories, 0) : 0;
    const goal = log ? log.dailyGoal : 2000; // fallback if no log
    
    return {
      date: dateStr,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      calories: total,
      goal: goal,
      isOver: total > goal
    };
  }).reverse();

  const avgIntake = Math.round(
    last7Days.reduce((sum, d) => sum + d.calories, 0) / 7
  );

  return (
    <div className="space-y-10 pb-24 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] mb-2">History</h2>
          <h1 className="text-5xl font-black text-primary tracking-tighter">Your Progress</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-8 py-3 rounded-[20px]"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="text-center bg-primary text-white border-none py-10 shadow-xl shadow-primary/10">
          <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Weekly Average</div>
          <div className="text-5xl font-black italic">{avgIntake}</div>
          <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter mt-1">kcal / Day</div>
        </Card>
        <Card className="text-center bg-surface border-accent/30 py-10">
          <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Consistency</div>
          <div className="text-5xl font-black text-primary">
            {Math.round((last7Days.filter(d => d.calories > 0 && !d.isOver).length / 7) * 100)}%
          </div>
          <div className="text-[10px] font-bold text-text-muted opacity-40 uppercase tracking-tighter mt-1">Days on Target</div>
        </Card>
      </div>

      <Card title="Calorie Intake (Past Week)">
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#b7e4c744" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#1b4332', opacity: 0.6 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#1b4332', opacity: 0.2 }}
              />
              <Tooltip 
                cursor={{ fill: '#f1f8f4' }}
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: '1px solid #b7e4c7', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '16px'
                }}
                labelStyle={{ fontWeight: 900, color: '#1b4332', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                itemStyle={{ fontSize: '14px', fontWeight: 700, color: '#52b788' }}
              />
              <Bar dataKey="calories" radius={[10, 10, 0, 0]}>
                {last7Days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isOver ? '#e63946' : '#52b788'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-primary tracking-tight">Recent Overview</h3>
        <div className="space-y-2">
          {last7Days.slice().reverse().map((day) => (
            <div key={day.date} className="flex justify-between items-center bg-bg p-6 rounded-[24px] border border-accent/20 shadow-sm">
              <span className="font-bold text-primary">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <div className="text-right">
                <span className={`text-xl font-black ${day.isOver ? 'text-error' : 'text-secondary'}`}>
                  {day.calories}
                </span>
                <span className="text-[10px] font-black text-text-muted opacity-40 ml-2 uppercase tracking-widest">/ {day.goal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
