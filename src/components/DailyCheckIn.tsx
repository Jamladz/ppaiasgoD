
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Star, Sparkles } from 'lucide-react';

interface DailyCheckInProps {
  streakCount: number;
  onCheckIn: () => void;
  onClose: () => void;
}

export default function DailyCheckIn({ streakCount, onCheckIn, onClose }: DailyCheckInProps) {
  const nextStreak = streakCount + 1;
  const reward = 500 + (nextStreak * 50);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-zinc-900 border-t border-zinc-800 w-full max-w-xl rounded-t-[32px] sm:rounded-t-[40px] p-6 sm:p-8 pb-10 sm:pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] min-h-[50vh] overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />
        
        <div className="flex-1 flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-white/5 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <img 
                src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png" 
                alt="Daily Check-in" 
                className="w-24 h-24 object-contain relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h2 className="text-3xl font-black mb-2 tracking-tight">Daily Check-In</h2>
            <p className="text-zinc-500 text-sm mb-6 font-medium">
              You've been active for <span className="text-white font-black">{streakCount} days</span> in a row!
            </p>

            <div className="flex flex-col items-center justify-center py-4 mb-8">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">+{reward.toLocaleString()}</span>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-[0.3em] mt-2.5">DOGS</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onCheckIn();
              onClose();
            }}
            className="w-full relative group outline-none"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent rounded-[24px] blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-full bg-white text-black py-4 sm:py-5 rounded-[22px] font-black text-base sm:text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.15)] transition-all duration-300">
              <Sparkles className="w-4 h-4 text-black/40" />
              <span>Check-In</span>
              <div className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
