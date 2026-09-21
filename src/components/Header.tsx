
import { motion } from 'motion/react';
import { TonConnectButton } from '@tonconnect/ui-react';

interface HeaderProps {
  // Initials and onProfileClick removed from here
}

export default function Header({ }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-10 pb-5 bg-zinc-950/50 backdrop-blur-lg sticky top-0 z-40 border-b border-zinc-900/50">
      <div className="flex items-center gap-2">
        <img 
          src="https://i.ibb.co/d0p8trHN/ei-1789990670504-removebg-preview.png" 
          alt="Logo" 
          className="h-[1.1em] w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <span className="font-black text-lg tracking-tight">Dogs Ai</span>
      </div>

      <div className="scale-90 origin-right">
        <TonConnectButton />
      </div>
    </div>
  );
}
