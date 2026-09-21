
import { motion } from 'motion/react';
import { UserState } from '../types';
import { X, Settings, ShieldCheck, Wallet } from 'lucide-react';

interface ProfileProps {
  user: UserState;
  onClose: () => void;
}

export default function Profile({ user, onClose }: ProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col max-h-screen overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-6 sm:py-8">
        <h2 className="text-3xl font-black tracking-tight">Account</h2>
        <button 
          onClick={onClose}
          className="p-2 sm:p-3 bg-zinc-900/50 rounded-full hover:bg-zinc-800 transition-colors border border-zinc-800/50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 flex flex-col items-center pt-2 pb-8 overflow-y-auto">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-white to-zinc-400 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-zinc-900 shadow-[0_20px_50px_rgba(255,255,255,0.05)] relative group">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-4xl font-black text-black relative z-10">{user.initials}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight">@{user.username}</h3>
        <p className="text-zinc-500 font-bold mb-8 sm:mb-10 uppercase tracking-widest text-[10px]">
          {user.isPremium ? 'Premium Member' : 'Standard Member'} • ID: {user.uid.slice(0, 8).toUpperCase()}
        </p>

        <div className="w-full max-w-sm space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-5 sm:p-6 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
              </div>
              <div>
                <div className="font-black text-sm">TON Wallet</div>
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                  {user.walletAddress ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}` : 'Not Connected'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 sm:p-8 flex flex-col items-center backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-12 h-12 rotate-12" />
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-2">Available Balance</span>
            <div className="flex items-center gap-2">
              <img 
                src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png" 
                className="h-9 w-auto object-contain" 
                alt="coin"
                referrerPolicy="no-referrer"
              />
              <span className="text-4xl font-black tracking-tighter leading-none">{user.totalPoints.toLocaleString()}</span>
            </div>
            <div className="mt-4 text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Estimated Value: ${(user.totalPoints * 0.00001).toFixed(2)}</div>
          </div>
          
          <div className="h-px bg-zinc-900/50 my-4 sm:my-6" />

          <button className="w-full bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 rounded-[32px] p-5 sm:p-6 flex items-center gap-4 transition-all group backdrop-blur-xl">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 group-hover:rotate-45 transition-transform" />
            <span className="font-black text-sm">Security & Privacy</span>
          </button>
        </div>
      </div>

      <div className="mt-auto pb-8 text-center">
        <p className="text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em]">Dogs Ai Protocol • v1.0.4</p>
      </div>
    </motion.div>
  );
}
