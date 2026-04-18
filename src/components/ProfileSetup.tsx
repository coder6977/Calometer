import React, { useState, useRef } from 'react';
import { UserProfile, ActivityLevel, FitnessGoal } from '../types';
import { Card, Button, Input, Select } from './UI';
import { ACTIVITY_LABELS, GOAL_LABELS } from '../constants';
import { motion } from 'motion/react';
import { Camera, User as UserIcon } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  title?: string;
  buttonText?: string;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ 
  onComplete, 
  initialProfile,
  title = "Welcome to CaloMeter",
  buttonText = "Start My Journey"
}) => {
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile || {
    gender: 'male',
    activityLevel: 'sedentary',
    goal: 'maintenance'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please choose an image smaller than 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize the image using a canvas
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfile(prev => ({ ...prev, avatar: dataUrl }));
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => console.error("Error reading file");
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.age && profile.height && profile.weight) {
      onComplete(profile as UserProfile);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
        <p className="text-text-muted mt-2">Let's set up your personalized health profile.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-surface border-2 border-dashed border-accent/40 flex items-center justify-center cursor-pointer group overflow-hidden"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={32} className="text-text-muted/40" />
                )}
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              {profile.avatar && (
                <button
                  type="button"
                  onClick={() => setProfile(prev => {
                    const next = { ...prev };
                    delete next.avatar;
                    return next;
                  })}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest text-error hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-2">Profile Picture</p>
          </div>

          <Input 
            label="Name" 
            placeholder="Your name" 
            value={profile.name || ''} 
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Age" 
              type="number" 
              min={0}
              placeholder="Years" 
              value={profile.age || ''} 
              onChange={(e) => setProfile(prev => ({ ...prev, age: Math.max(0, parseInt(e.target.value) || 0) }))}
              required
            />
            <Select 
              label="Gender" 
              value={profile.gender}
              onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as any }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Height (cm)" 
              type="number" 
              min={0}
              placeholder="cm" 
              value={profile.height || ''} 
              onChange={(e) => setProfile(prev => ({ ...prev, height: Math.max(0, parseFloat(e.target.value) || 0) }))}
              required
            />
            <Input 
              label="Weight (kg)" 
              type="number" 
              min={0}
              placeholder="kg" 
              value={profile.weight || ''} 
              onChange={(e) => setProfile(prev => ({ ...prev, weight: Math.max(0, parseFloat(e.target.value) || 0) }))}
              required
            />
          </div>

          <Select 
            label="Activity Level" 
            value={profile.activityLevel}
            onChange={(e) => setProfile(prev => ({ ...prev, activityLevel: e.target.value as ActivityLevel }))}
          >
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <Select 
            label="Your Goal" 
            value={profile.goal}
            onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value as FitnessGoal }))}
          >
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <Input 
            label="Custom Weight Goal (Optional)" 
            type="number" 
            min={0}
            placeholder="Target Goal (kg)" 
            value={profile.targetWeight || ''} 
            onChange={(e) => setProfile(prev => ({ ...prev, targetWeight: e.target.value ? Math.max(0, parseFloat(e.target.value)) : undefined }))}
          />

          <Input 
            label="Manual Calorie Goal (Overrides calculation)" 
            type="number" 
            min={0}
            placeholder="e.g. 2500" 
            value={profile.customDailyGoal || ''} 
            onChange={(e) => setProfile(prev => ({ ...prev, customDailyGoal: e.target.value ? Math.max(0, parseInt(e.target.value)) : undefined }))}
          />

          <Button type="submit" className="w-full">
            {buttonText}
          </Button>

          {initialProfile && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to remove all profile information and logs? This action cannot be undone.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full mt-4 p-4 border border-error/20 rounded-2xl text-error text-[10px] font-black uppercase tracking-widest hover:bg-error/5 transition-colors"
            >
              Reset All Data & Start Over
            </button>
          )}
        </form>
      </Card>
    </motion.div>
  );
};
