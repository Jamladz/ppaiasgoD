
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState } from '../types';

interface OnboardingProps {
  user: UserState;
  onComplete: () => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [localStep, setLocalStep] = useState(1);
  const isStep1 = localStep === 1;

  const handleNext = () => {
    if (isStep1) {
      setLocalStep(2);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen p-6 sm:p-8 bg-zinc-950 text-white font-sans selection:bg-zinc-800 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={localStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center w-full max-w-sm sm:max-w-md text-center flex-1 justify-center"
        >
          {isStep1 ? (
            <>
              <div className="mb-6 sm:mb-8">
                <img
                  src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png"
                  alt="Dogs Ai Logo"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Telegram Account Age</h1>
              <p className="text-zinc-500 mb-6 sm:mb-8 text-xs sm:text-sm">Calculating your loyalty rewards...</p>
              
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 sm:p-8 w-full backdrop-blur-xl">
                <div className="flex flex-col gap-5 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Account Age</span>
                    <div className="text-3xl sm:text-4xl font-black mt-2">{user.accountAge} Years</div>
                  </div>
                  <div className="h-px bg-zinc-800/50 w-2/3 mx-auto" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Base Reward</span>
                    <div className="text-3xl sm:text-4xl font-black mt-2">+{user.coins.toLocaleString()} DOGS</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 sm:mb-8 flex justify-center">
                 <div className="w-32 h-32 sm:w-40 sm:h-40 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800/50 shadow-2xl shadow-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent" />
                    <span className="text-4xl sm:text-5xl relative z-10">💎</span>
                 </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Telegram Premium</h1>
              <p className="text-zinc-500 mb-6 sm:mb-8 text-xs sm:text-sm">Extra rewards for being special.</p>
              
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 sm:p-8 w-full backdrop-blur-xl">
                <div className="flex flex-col gap-5 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Status</span>
                    <div className={`text-3xl sm:text-4xl font-black mt-2 ${user.isPremium ? 'text-sky-400' : 'text-zinc-300'}`}>
                      {user.isPremium ? 'Premium Active' : 'Basic Member'}
                    </div>
                  </div>
                  <div className="h-px bg-zinc-800/50 w-2/3 mx-auto" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Premium Bonus</span>
                    <div className="text-3xl sm:text-4xl font-black mt-2 text-sky-400">+{user.premiumBonus.toLocaleString()} DOGS</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full max-w-sm sm:max-w-md bg-white text-black py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl mb-6 sm:mb-8 shadow-[0_20px_50px_rgba(255,255,255,0.1)] outline-none"
      >
        Next
      </motion.button>
    </div>
  );
}
