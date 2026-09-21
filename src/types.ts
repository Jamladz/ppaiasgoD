
export type AppStep = 'onboarding1' | 'onboarding2' | 'main';
export type Tab = 'home' | 'tasks' | 'friends';

export interface UserState {
  uid: string;
  username: string;
  initials: string;
  accountAge: number; // in years
  coins: number;
  isPremium: boolean;
  premiumBonus: number;
  totalPoints: number;
  onboardingCompleted: boolean;
  referredBy?: string;
  referralCount: number;
  walletAddress?: string;
  completedTasks: string[];
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  icon: string;
}
