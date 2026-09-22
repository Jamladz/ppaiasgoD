
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from '../lib/firebase';
import { UserState } from '../types';
import { getTelegramUser, estimateAccountAge, getStartParam } from '../lib/telegram';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const code = (error as any)?.code || 'unknown';
  const message = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return `Failed to sync with database (${code}).`;
};

interface FirebaseContextType {
  user: UserState | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateWalletAddress: (address: string) => Promise<void>;
  completeTask: (taskId: string, reward: number) => Promise<void>;
  checkIn: () => Promise<void>;
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
    const path = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const tgUser = getTelegramUser();
        let updatedAge = data.accountAge;
        let updatedCoins = data.coins;
        let updatedPoints = data.totalPoints;
        let needsUpdate = false;

        // If the user was created with default data (age 5) but we now have real TG data, update it
        if (tgUser && (data.accountAge === 5 || !data.accountAge)) {
          const realAge = estimateAccountAge(tgUser.id);
          if (realAge !== data.accountAge) {
            updatedAge = realAge;
            const coinDiff = (realAge - (data.accountAge || 0)) * 1000;
            updatedCoins = (data.coins || 0) + coinDiff;
            updatedPoints = (data.totalPoints || 0) + coinDiff;
            needsUpdate = true;
          }
        }

        const updatedUserState = {
          ...data,
          accountAge: updatedAge,
          coins: updatedCoins,
          totalPoints: updatedPoints,
          completedTasks: data.completedTasks || [],
          streakCount: data.streakCount || 0,
          lastCheckIn: data.lastCheckIn || null
        } as UserState;

        setUser(updatedUserState);
        
        // Update last login and potentially account age (non-blocking)
        const updates: any = { lastLogin: serverTimestamp() };
        if (needsUpdate) {
          updates.accountAge = updatedAge;
          updates.coins = updatedCoins;
          updates.totalPoints = updatedPoints;
        }
        updateDoc(userRef, updates).catch(e => console.warn("Failed to update user data:", e));
      } else {
        // Initial setup for new user
        const tgUser = getTelegramUser();
        const startParam = getStartParam();
        const age = tgUser ? estimateAccountAge(tgUser.id) : 5;
        const baseCoins = age * 1000;
        const isPremium = tgUser?.is_premium || false;
        const premiumBonus = isPremium ? 5000 : 0;

        // Better initials logic (Telegram style)
        let generatedInitials = 'U';
        if (tgUser) {
          if (tgUser.first_name && tgUser.last_name) {
            generatedInitials = (tgUser.first_name[0] + tgUser.last_name[0]).toUpperCase();
          } else if (tgUser.first_name) {
            generatedInitials = tgUser.first_name.substring(0, 2).toUpperCase();
          }
        } else if (firebaseUser.displayName) {
          const names = firebaseUser.displayName.split(' ');
          if (names.length >= 2) {
            generatedInitials = (names[0][0] + names[1][0]).toUpperCase();
          } else {
            generatedInitials = firebaseUser.displayName.substring(0, 2).toUpperCase();
          }
        }
        
        let referredBy = '';
        let inviterUid = '';

        if (startParam && startParam.startsWith('ref_')) {
          referredBy = startParam.replace('ref_', '');
        }
        
        // Safety check for referral ID format
        const isValidRef = referredBy && /^[a-zA-Z0-9_\-]+$/.test(referredBy);

        if (isValidRef) {
          // Check if referredBy is a Telegram ID (numeric) or a Firebase UID
          const isNumeric = /^\d+$/.test(referredBy);
          
          if (isNumeric) {
            // Search for user by telegramId
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('telegramId', '==', parseInt(referredBy)));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              inviterUid = querySnap.docs[0].id;
            }
          } else {
            inviterUid = referredBy;
          }
        }

        const newUser: UserState = {
          uid: firebaseUser.uid,
          telegramId: tgUser?.id,
          username: tgUser?.username || firebaseUser.displayName?.replace(/\s/g, '').toLowerCase() || 'user',
          initials: generatedInitials,
          accountAge: age,
          coins: baseCoins,
          isPremium: isPremium,
          premiumBonus: premiumBonus,
          totalPoints: baseCoins + premiumBonus,
          onboardingCompleted: false,
          referredBy: inviterUid || undefined,
          referralCount: 0,
          walletAddress: '',
          completedTasks: [],
          streakCount: 0,
          lastCheckIn: null
        };

        const dataToSave = {
          ...newUser,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };

        // Remove undefined fields to prevent 'invalid-argument'
        Object.keys(dataToSave).forEach(key => {
          if ((dataToSave as any)[key] === undefined) {
            delete (dataToSave as any)[key];
          }
        });

        await setDoc(userRef, dataToSave);

        // Credit the inviter if applicable
        if (inviterUid && inviterUid !== firebaseUser.uid) {
          const inviterRef = doc(db, 'users', inviterUid);
          try {
            const inviterSnap = await getDoc(inviterRef);
            if (inviterSnap.exists()) {
              await updateDoc(inviterRef, {
                referralCount: increment(1),
                totalPoints: increment(2500)
              });
            }
          } catch (inviterErr) {
            console.warn("Failed to credit inviter:", inviterErr);
          }
        }
        
        setUser(newUser);
      }
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      console.error("Database sync error details:", err);
      // Detailed error logging for invalid-argument
      if (err.code === 'invalid-argument') {
        console.error("Invalid Argument in Firestore call. Check document structure.");
      }
      // Specific handling for common issues
      if (err.code === 'permission-denied') {
        setError("Access denied. Please restart the app.");
      } else {
        setError(handleFirestoreError(err, OperationType.GET, path));
      }
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

  const checkIn = async () => {
    if (!auth.currentUser || !user) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const now = new Date();
      const lastCheckInDate = user.lastCheckIn ? (user.lastCheckIn.toDate ? user.lastCheckIn.toDate() : new Date(user.lastCheckIn)) : null;
      
      let newStreak = 1;
      const reward = 500; // Base daily reward

      if (lastCheckInDate) {
        const diffInHours = (now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) return; // Already checked in
        
        if (diffInHours < 48) {
          newStreak = (user.streakCount || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      const totalReward = reward + (newStreak * 50); // Streak bonus

      await updateDoc(userRef, {
        streakCount: newStreak,
        lastCheckIn: serverTimestamp(),
        totalPoints: increment(totalReward),
        lastLogin: serverTimestamp()
      });

      setUser({
        ...user,
        streakCount: newStreak,
        lastCheckIn: now,
        totalPoints: user.totalPoints + totalReward
      });
    } catch (err) {
      console.error("Error during check-in:", err);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, error, signIn, completeOnboarding, updateWalletAddress, completeTask, checkIn }}>
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
