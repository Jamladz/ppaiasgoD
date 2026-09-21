
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-zinc-900 border-t border-zinc-800 w-full max-w-md rounded-t-[40px] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '50vh' }}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />
        
        <div className="flex flex-col items-center text-center">
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
          <p className="text-zinc-500 text-sm mb-8 font-medium">
            You've been active for <span className="text-white font-black">{streakCount} days</span> in a row!
          </p>

          <div className="bg-zinc-800/30 border border-zinc-800/50 rounded-[32px] p-6 w-full mb-8 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Today's Reward</div>
                <div className="text-xl font-black">{reward.toLocaleString()} DOGS</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/30">
               <span className="text-xs font-black text-amber-400">{nextStreak}d</span>
               <Calendar className="w-3 h-3 text-zinc-500" />
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
