
import { motion } from 'motion/react';
import { Home, ClipboardList, Users } from 'lucide-react';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  initials: string;
  onProfileClick: () => void;
}

export default function Navigation({ activeTab, setActiveTab, initials, onProfileClick }: NavigationProps) {
  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'tasks' as Tab, label: 'Tasks', icon: ClipboardList },
    { id: 'friends' as Tab, label: 'Friends', icon: Users },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[92%] sm:max-w-md z-50 flex items-center gap-3">
      <div className="flex-1 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/50 rounded-full p-1.5 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative py-3.5 px-6 rounded-full transition-all duration-300 group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full shadow-lg shadow-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={`relative z-10 w-5 h-5 transition-all duration-300 ${
                  isActive ? 'text-black scale-110' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} 
              />
            </button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onProfileClick}
        className="aspect-square h-[60px] shrink-0 bg-gradient-to-br from-sky-400 to-blue-600 border border-white/10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300"
      >
        <span className="text-sm font-black tracking-tight text-white">{initials}</span>
      </motion.button>
    </div>
  );
}
