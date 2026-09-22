
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-zinc-900 border-t border-zinc-800 w-full max-w-md rounded-t-[40px] p-8 pb-14 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] h-[75vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-10" />
        
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-8"
          >
            <img 
              src="https://i.ibb.co/CKt6P3H9/ei-1790070162534-removebg-preview.png" 
              alt="Daily Reward" 
              className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 tracking-tight">Daily Reward</h2>
          <div className="flex items-center gap-2 mb-8 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
            <span className="text-2xl font-black text-amber-400">+{reward.toLocaleString()}</span>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Dogs</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onCheckIn();
              onClose();
            }}
            className="w-full bg-white text-black py-5 rounded-[24px] font-black text-xl uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-95"
          >
            Check-In
          </motion.button>
          
          <p className="mt-6 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            Come back tomorrow for a bigger reward!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
