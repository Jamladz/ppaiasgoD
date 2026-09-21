
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, Tab, Task } from '../types';
import Header from './Header';
import Navigation from './Navigation';
import Profile from './Profile';
import { CheckCircle2, Circle, TrendingUp, Trophy, Users, Copy, Share2, UserPlus, Wallet } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useFirebase } from '../contexts/FirebaseContext';

interface MainAppProps {
  user: UserState;
}

export default function MainApp({ user }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { updateWalletAddress, completeTask } = useFirebase();
  const [verifyingTasks, setVerifyingTasks] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet?.account.address) {
        updateWalletAddress(wallet.account.address);
      }
    });
    return () => unsubscribe();
  }, [tonConnectUI, updateWalletAddress]);

  const referralLink = `https://t.me/DogsAIApp_bot?start=ref_${user.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    // @ts-ignore
    const webApp = window.Telegram?.WebApp;
    const text = `Join Dogs Ai and claim your rewards! 🐾`;
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    
    if (webApp) {
      webApp.openTelegramLink(fullUrl);
    } else {
      window.open(fullUrl, '_blank');
    }
  };

  const availableTasks = [
    { id: 'wallet', title: 'Connect TON Wallet', reward: 5000, icon: '💎', link: null },
    { id: 'tg_channel', title: 'Join our Telegram Channel', reward: 1000, icon: '📢', link: 'https://t.me/DogsAIApp_bot' },
    { id: 'invite_friends', title: 'Invite 5 Friends', reward: 2500, icon: '👥', link: null },
  ];

  const handleTaskClick = async (task: any) => {
    const completedTasks = user.completedTasks || [];
    if (completedTasks.includes(task.id) || verifyingTasks.includes(task.id)) return;

    if (task.id === 'wallet') {
      tonConnectUI.openModal();
      return;
    }

    if (task.id === 'invite_friends') {
      if (user.referralCount >= 5) {
        await completeTask(task.id, task.reward);
      } else {
        setActiveTab('friends');
      }
      return;
    }

    // Generic verification flow for link-based tasks
    if (task.link) {
      // @ts-ignore
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        webApp.openTelegramLink(task.link);
      } else {
        window.open(task.link, '_blank');
      }

      setVerifyingTasks(prev => [...prev, task.id]);
      
      // Simulate verification delay (3 seconds)
      setTimeout(async () => {
        await completeTask(task.id, task.reward);
        setVerifyingTasks(prev => prev.filter(id => id !== task.id));
      }, 3000);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center pt-6 px-6 sm:px-8 h-full justify-center"
          >
            <div className="relative mb-8 group">
               <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-all duration-700" />
               <img 
                 src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png" 
                 alt="Main Dog" 
                 className="w-40 h-40 sm:w-48 sm:h-48 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                 referrerPolicy="no-referrer"
               />
            </div>
            
            <h2 className="text-5xl sm:text-6xl font-black mb-1 tracking-tighter drop-shadow-sm">{user.totalPoints.toLocaleString()}</h2>
            <p className="text-zinc-500 font-black tracking-[0.3em] uppercase text-[10px] mb-8">DOGS TOKEN BALANCE</p>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Streak</span>
                </div>
                <div className="text-xl font-black">5 Days</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Rank</span>
                </div>
                <div className="text-xl font-black">#4,201</div>
              </div>
            </div>
          </motion.div>
        );
      case 'tasks':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 sm:p-8"
          >
            <h2 className="text-2xl font-black mb-6 tracking-tight">Available Tasks</h2>
            <div className="space-y-3.5">
              {availableTasks.map((task) => {
                const isCompleted = (user.completedTasks || []).includes(task.id);
                const isVerifying = verifyingTasks.includes(task.id);
                
                return (
                  <div 
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-[28px] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all duration-300 backdrop-blur-xl group hover:border-zinc-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800/50 rounded-[20px] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {task.icon}
                      </div>
                      <div>
                        <div className="font-black text-sm sm:text-base">{task.title}</div>
                        <div className="text-zinc-500 text-xs font-bold mt-0.5">+{task.reward.toLocaleString()} DOGS</div>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="w-8 h-8 bg-emerald-400/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    ) : isVerifying ? (
                      <div className="w-8 h-8 bg-zinc-800/50 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-zinc-800/50 rounded-full flex items-center justify-center">
                        <Circle className="w-5 h-5 text-zinc-700" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      case 'friends':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8"
          >
            <h2 className="text-2xl font-black mb-6 tracking-tight">Invite Friends</h2>
            
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-8 mb-6 backdrop-blur-xl text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="w-20 h-20 bg-zinc-800/50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-500">
                🤝
              </div>
              <h3 className="text-xl font-black mb-2">Share the Love</h3>
              <p className="text-zinc-500 text-xs sm:text-sm mb-8 leading-relaxed font-medium px-4">
                Earn <span className="text-white">2,500 DOGS</span> for every friend you invite. There's no limit!
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={shareLink}
                  className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Share2 className="w-4 h-4" />
                  Invite Friend
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="w-14 h-14 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-2xl flex items-center justify-center transition-colors active:scale-95"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-zinc-400" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Total Invited</span>
                </div>
                <div className="text-2xl font-black">{user.referralCount || 0}</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Earned</span>
                </div>
                <div className="text-2xl font-black">{(user.referralCount || 0) * 2500}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] ml-2 mb-2">Recent Referrals</h4>
              <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-[28px] p-8 text-center">
                <p className="text-zinc-600 text-xs font-bold">No referrals yet. Start inviting!</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-white overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-32">
        {renderTab()}
      </main>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsProfileOpen(false);
        }} 
        initials={user.initials}
        onProfileClick={() => setIsProfileOpen(prev => !prev)}
      />
      
      <AnimatePresence>
        {isProfileOpen && (
          <Profile 
            user={user} 
            onClose={() => setIsProfileOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
