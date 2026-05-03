import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: Date;
}

export interface GamificationState {
  streak: number;
  xp: number;
  level: number;
  hearts: number;
  coins: number;
  completedQuests: string[];
  badges: Badge[];
  lastVisitDate: string | null;
  
  // Actions
  incrementStreak: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  completeQuest: (questId: string) => void;
  unlockBadge: (badge: Omit<Badge, 'unlockedAt'>) => void;
  resetStreakIfNeeded: () => void;
  checkDailyStreak: () => boolean;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      streak: 7,
      xp: 1240,
      level: 14,
      hearts: 3,
      coins: 245,
      completedQuests: ['life-of-christ-1', 'psalms-peace'],
      badges: [
        {
          id: 'first-steps',
          name: 'First Steps',
          icon: '🌱',
          unlockedAt: new Date(),
        },
      ],
      lastVisitDate: new Date().toISOString().split('T')[0],

      incrementStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        set({
          streak: state.streak + 1,
          lastVisitDate: today,
          xp: state.xp + 50,
          coins: state.coins + 25,
        });
      },

      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = Math.floor(newXP / 500) + 1; // Level up every 500 XP
          return {
            xp: newXP,
            level: Math.max(state.level, newLevel),
          };
        });
      },

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      completeQuest: (questId) => set((state) => ({
        completedQuests: [...state.completedQuests, questId],
        xp: state.xp + 100,
        coins: state.coins + 50,
      })),

      unlockBadge: (badgeData) => set((state) => ({
        badges: [
          ...state.badges,
          { ...badgeData, unlockedAt: new Date() },
        ],
      })),

      resetStreakIfNeeded: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.lastVisitDate && state.lastVisitDate !== today) {
          const lastDate = new Date(state.lastVisitDate);
          const currentDate = new Date();
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
          
          if (diffDays > 1) {
            set({ streak: 0 });
          }
        }
      },

      checkDailyStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (!state.lastVisitDate || state.lastVisitDate !== today) {
          // Trigger streak increment logic in component
          return true;
        }
        return false;
      },
    }),
    {
      name: 'bornblix-gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
