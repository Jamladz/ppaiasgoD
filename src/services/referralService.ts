
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  increment, 
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { ReferralRecord, UserState } from '../types';

export const REFERRAL_REWARD = 2500;

/**
 * Creates a referral link for a user using their official Telegram ID
 */
export const createReferralLink = (telegramId: number | undefined, uid: string) => {
  const botUsername = 'DogsAIApp_bot';
  // Use the numeric telegramId if available, otherwise fallback to uid
  // The 'ref_' prefix is standard for identifying referral params
  const refId = telegramId ? telegramId.toString() : uid;
  
  // Official Telegram format for Mini Apps: t.me/botusername/appname?startapp=parameter
  // We use 'app' as the default app name placeholder
  return `https://t.me/${botUsername}/app?startapp=ref_${refId}`;
};

/**
 * Identifies the inviter based on the referral ID (telegramId or uid)
 */
export const identifyInviter = async (refId: string) => {
  if (!refId) return null;

  // Check if it's a numeric Telegram ID
  const isNumeric = /^\d+$/.test(refId);
  
  if (isNumeric) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telegramId', '==', parseInt(refId)));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].id; // Return the Firebase UID
    }
  } else {
    // Check if it's a direct Firebase UID
    const userRef = doc(db, 'users', refId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return refId;
    }
  }
  
  return null;
};

/**
 * Processes a referral when a new user signs up
 */
export const processReferral = async (invitee: UserState, inviterId: string) => {
  // Prevent self-referral
  if (inviterId === invitee.uid) return false;

  try {
    const inviterRef = doc(db, 'users', inviterId);
    const inviterSnap = await getDoc(inviterRef);

    if (!inviterSnap.exists()) return false;

    // 1. Create a referral record
    const referralRecord = {
      inviterId,
      inviteeId: invitee.uid,
      inviteeUsername: invitee.username,
      inviteeInitials: invitee.initials,
      inviteeAccountAge: invitee.accountAge,
      inviteeIsPremium: invitee.isPremium,
      rewardAmount: REFERRAL_REWARD,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, 'referrals'), referralRecord);

    // 2. Update inviter's stats
    await updateDoc(inviterRef, {
      referralCount: increment(1),
      earnedReferralCoins: increment(REFERRAL_REWARD),
      totalPoints: increment(REFERRAL_REWARD)
    });

    return true;
  } catch (err) {
    console.error("Error processing referral:", err);
    return false;
  }
};

/**
 * Fetches all referrals for a specific inviter
 */
export const getInviterReferrals = async (inviterId: string): Promise<ReferralRecord[]> => {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(referralsRef, where('inviterId', '==', inviterId));
    const querySnap = await getDocs(q);
    
    return querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ReferralRecord[];
  } catch (err) {
    console.error("Error fetching referrals:", err);
    return [];
  }
};
