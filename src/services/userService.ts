
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserState } from '../types';

/**
 * Initializes or updates user data
 * Prioritizes telegramId to ensure unique accounts per Telegram user
 */
export const initializeUser = async (uid: string, data: Partial<UserState>) => {
  let userRef = doc(db, 'users', uid);
  let userData: UserState | null = null;
  let isNewUser = false;

  // 1. If we have a telegramId, try to find an existing user with this ID
  if (data.telegramId) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', data.telegramId));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      userRef = doc(db, 'users', docSnap.id);
      userData = { ...docSnap.data(), id: docSnap.id } as any;
    }
  }

  // 2. If not found by telegramId, try finding by firebase uid
  if (!userData) {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      userData = { ...userSnap.data(), id: userSnap.id } as any;
    }
  }

  if (userData) {
    // Update existing user (last login, and potentially telegram details if they were missing)
    const updates: any = {
      lastLogin: serverTimestamp()
    };
    
    // Fill in missing telegram info if available now
    if (data.telegramId && !userData.telegramId) updates.telegramId = data.telegramId;
    if (data.username && !userData.username) updates.username = data.username;
    
    await updateDoc(userRef, updates);
    return { ...userData, ...updates, ...data } as UserState;
  } else {
    // 3. Create new user
    isNewUser = true;
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
    return { ...newUser, isNew: true } as any;
  }
};
