
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from '../lib/firebase';
import { UserState } from '../types';
import { getTelegramUser, estimateAccountAge, getStartParam } from '../lib/telegram';

interface FirebaseContextType {
  user: UserState | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateWalletAddress: (address: string) => Promise<void>;
  completeTask: (taskId: string, reward: number) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        // Try anonymous sign-in first for seamless experience if allowed
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.log("Anonymous auth not enabled, waiting for manual sign-in");
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUser({
          ...data,
          completedTasks: data.completedTasks || []
        } as UserState);
      } else {
        // Initial setup for new user
        const tgUser = getTelegramUser();
        const startParam = getStartParam();
        const age = tgUser ? estimateAccountAge(tgUser.id) : 5; // Default 5 years for preview
        const baseCoins = age * 1000;
        const isPremium = tgUser?.is_premium || false;
        const premiumBonus = isPremium ? 5000 : 0;
        
        let referredBy = '';
        if (startParam && startParam.startsWith('ref_')) {
          referredBy = startParam.replace('ref_', '');
        }

        const newUser: UserState = {
          uid: firebaseUser.uid,
          username: tgUser?.username || firebaseUser.displayName?.replace(/\s/g, '').toLowerCase() || 'user',
          initials: (tgUser?.first_name?.[0] || firebaseUser.displayName?.[0] || 'U').toUpperCase(),
          accountAge: age,
          coins: baseCoins,
          isPremium: isPremium,
          premiumBonus: premiumBonus,
          totalPoints: baseCoins + premiumBonus,
          onboardingCompleted: false,
          referredBy: referredBy || undefined,
          referralCount: 0,
          walletAddress: '',
          completedTasks: []
        };

        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });

        // Credit the inviter if applicable
        if (referredBy && referredBy !== firebaseUser.uid) {
          const inviterRef = doc(db, 'users', referredBy);
          const inviterSnap = await getDoc(inviterRef);
          if (inviterSnap.exists()) {
            await updateDoc(inviterRef, {
              referralCount: increment(1),
              totalPoints: increment(2500) // Reward for inviter
            });
          }
        }
        
        setUser(newUser);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to sync with database.");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Login failed.");
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!auth.currentUser || !user) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        onboardingCompleted: true,
        lastLogin: serverTimestamp()
      });
      setUser({ ...user, onboardingCompleted: true });
    } catch (err) {
      console.error("Error completing onboarding:", err);
    }
  };

  const updateWalletAddress = async (address: string) => {
    if (!auth.currentUser || !user || user.walletAddress === address) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const isFirstConnection = !user.walletAddress;
      
      const updates: any = {
        walletAddress: address,
        lastLogin: serverTimestamp()
      };

      if (isFirstConnection) {
        const currentTasks = user.completedTasks || [];
        updates.totalPoints = increment(5000);
        updates.completedTasks = [...currentTasks, 'wallet'];
      }
      
      await updateDoc(userRef, updates);
      
      setUser({ 
        ...user, 
        walletAddress: address,
        totalPoints: isFirstConnection ? user.totalPoints + 5000 : user.totalPoints,
        completedTasks: isFirstConnection ? [...(user.completedTasks || []), 'wallet'] : (user.completedTasks || [])
      });
    } catch (err) {
      console.error("Error updating wallet address:", err);
    }
  };

  const completeTask = async (taskId: string, reward: number) => {
    const tasks = user?.completedTasks || [];
    if (!auth.currentUser || !user || tasks.includes(taskId)) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updatedTasks = [...tasks, taskId];
      await updateDoc(userRef, {
        completedTasks: updatedTasks,
        totalPoints: increment(reward),
        lastLogin: serverTimestamp()
      });
      setUser({
        ...user,
        completedTasks: updatedTasks,
        totalPoints: user.totalPoints + reward
      });
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, error, signIn, completeOnboarding, updateWalletAddress, completeTask }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
