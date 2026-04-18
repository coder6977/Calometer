import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => (
  <div className={`bg-bg rounded-[32px] shadow-sm border border-accent/20 overflow-hidden ${className}`}>
    {title && (
      <div className="px-8 py-5 border-b border-accent/10 bg-surface/50">
        <h3 className="font-bold text-primary tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-8">
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-primary/10',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/10',
    danger: 'bg-error text-white hover:bg-error/90 shadow-error/10',
    outline: 'bg-transparent border-2 border-accent/40 text-primary hover:bg-accent/5 shadow-none'
  };

  return (
    <button 
      className={`px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-bold text-primary uppercase tracking-wider opacity-60 ml-1">{label}</label>}
    <input 
      className={`w-full px-5 py-3.5 bg-surface border border-accent/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-text-main placeholder:text-text-muted/40 font-medium ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-bold text-primary uppercase tracking-wider opacity-60 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full px-5 py-3.5 bg-surface border border-accent/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none text-text-main font-medium ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);
