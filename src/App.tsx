/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useFirebase } from './contexts/FirebaseContext';
import Onboarding from './components/Onboarding';
import MainApp from './components/MainApp';
import { LogIn, Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading, error, signIn, completeOnboarding } = useFirebase();

  useEffect(() => {
    // Official Telegram Mini App Fullscreen & Ready Initialization
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.requestFullscreen === 'function') {
          tg.requestFullscreen();
        }
        tg.setHeaderColor('#09090b');
        tg.setBackgroundColor('#09090b');
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation();
        }
      } catch (e) {
        console.log("Telegram WebApp initialization error:", e);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Connecting to Dogs Ai...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-8 text-center">
        <p className="text-red-500 font-black text-sm mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-6 py-3 rounded-full font-black text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-8 text-center">
        <div className="w-24 h-24 mb-8">
          <img 
            src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png" 
            alt="Dogs Ai" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome to Dogs Ai</h1>
        <p className="text-zinc-500 mb-10 text-sm max-w-[280px]">Connect your account to claim your Telegram rewards and start earning.</p>
        <button 
          onClick={signIn}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-[32px] font-black text-sm transition-transform active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <LogIn className="w-5 h-5" />
          Connect with Google
        </button>
      </div>
    );
  }

  if (user.onboardingCompleted) {
    return <MainApp user={user} />;
  }

  return (
    <div className="bg-zinc-950 h-screen text-white overflow-hidden">
      <Onboarding user={user} onComplete={completeOnboarding} />
    </div>
  );
}
