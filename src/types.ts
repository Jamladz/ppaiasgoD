
export type AppStep = 'onboarding1' | 'onboarding2' | 'main';
export type Tab = 'home' | 'tasks' | 'friends';

export interface UserState {
  uid: string;
  telegramId?: number;
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
  earnedReferralCoins: number;
  walletAddress?: string;
  completedTasks: string[];
  streakCount: number;
  lastCheckIn?: any; // Firebase Timestamp or ISO string
}

export interface ReferralRecord {
  id: string;
  inviterId: string; // Firebase UID of the inviter
  inviteeId: string; // Firebase UID of the new user
  inviteeUsername: string;
  inviteeInitials: string;
  inviteeAccountAge: number;
  inviteeIsPremium: boolean;
  rewardAmount: number;
  timestamp: any;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  icon: string;
}
