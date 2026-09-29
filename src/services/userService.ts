
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { UserState } from '../types';

/**
 * Initializes or updates user data
 */
export const initializeUser = async (uid: string, data: Partial<UserState>) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const existingData = userSnap.data();
    // Update last login
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    return { ...existingData, ...data } as UserState;
  } else {
    // Create new user
    const newUser: UserState = {
      uid,
      username: data.username || 'user',
      initials: data.initials || 'U',
      accountAge: data.accountAge || 0,
      coins: data.coins || 0,
      isPremium: data.isPremium || false,
      premiumBonus: data.premiumBonus || 0,
      totalPoints: data.totalPoints || 0,
      onboardingCompleted: false,
      referralCount: 0,
      earnedReferralCoins: 0,
      completedTasks: [],
      streakCount: 0,
      ...data
    };

    const dataToSave = {
      ...newUser,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    // Remove undefined
    Object.keys(dataToSave).forEach(key => {
      if ((dataToSave as any)[key] === undefined) {
        delete (dataToSave as any)[key];
      }
    });

    await setDoc(userRef, dataToSave);
    return newUser;
  }
};
