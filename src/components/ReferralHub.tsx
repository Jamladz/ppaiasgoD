
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Share2, Copy, CheckCircle2, Trophy, Users, Star } from 'lucide-react';
import { UserState, ReferralRecord } from '../types';
import { createReferralLink, getInviterReferrals, REFERRAL_REWARD } from '../services/referralService';

interface ReferralHubProps {
  user: UserState;
}

export default function ReferralHub({ user }: ReferralHubProps) {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      const data = await getInviterReferrals(user.uid);
      setReferrals(data);
      setLoading(false);
    };
    fetchReferrals();
  }, [user.uid]);

  const referralLink = createReferralLink(user.telegramId, user.uid);

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

  const referralMilestones = [
    { count: 5, reward: 5000, label: 'Starter' },
    { count: 10, reward: 15000, label: 'Influencer' },
    { count: 25, reward: 50000, label: 'Ambassador' },
    { count: 50, reward: 150000, label: 'Legend' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-8 backdrop-blur-xl text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="w-20 h-20 bg-zinc-800/50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-500">
          🤝
        </div>
        <h3 className="text-2xl font-black mb-2">Invite & Earn</h3>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium">
          Earn <span className="text-white">{REFERRAL_REWARD.toLocaleString()} DOGS</span> for every friend who joins.
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

        <div className="mt-8 pt-6 border-t border-zinc-800/50">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-2">Your Official ID</div>
              <div className="inline-flex items-center gap-2 bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                <code className="text-zinc-400 text-xs font-mono font-bold tracking-wider">{user.telegramId || 'Not Connected'}</code>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-2">Your Referral Link</div>
              <div className="bg-zinc-950/50 px-4 py-2.5 rounded-xl border border-zinc-800 truncate text-[10px] font-mono text-zinc-400">
                {referralLink}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Total Friends</span>
          </div>
          <div className="text-2xl font-black">{user.referralCount || 0}</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[28px] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Total Earned</span>
          </div>
          <div className="text-2xl font-black">{(user.earnedReferralCoins || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Referral Milestones */}
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[28px] p-6 backdrop-blur-xl">
        <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-6 flex items-center gap-2">
          <Star className="w-3 h-3 text-amber-400" />
          Milestone Rewards
        </h4>
        <div className="space-y-4">
          {referralMilestones.map((milestone) => {
            const progress = Math.min((user.referralCount / milestone.count) * 100, 100);
            const isCompleted = user.referralCount >= milestone.count;
            
            return (
              <div key={milestone.label} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                      {milestone.label}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600">({milestone.count} friends)</span>
                  </div>
                  <span className={`text-[11px] font-black ${isCompleted ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    +{milestone.reward.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${isCompleted ? 'bg-emerald-400' : 'bg-sky-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pb-8">
        <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] ml-2 mb-2">Friend List ({referrals.length})</h4>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
          </div>
        ) : referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div 
                key={ref.id}
                className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[24px] flex items-center justify-between backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800/50 rounded-full flex items-center justify-center text-xs font-black">
                    {ref.inviteeInitials}
                  </div>
                  <div>
                    <div className="font-bold text-sm">@{ref.inviteeUsername}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">
                      {ref.inviteeAccountAge} Years • {ref.inviteeIsPremium ? 'Premium' : 'Standard'}
                    </div>
                  </div>
                </div>
                <div className="text-emerald-400 font-black text-sm">+{ref.rewardAmount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-[28px] p-8 text-center">
            <p className="text-zinc-600 text-xs font-bold">No friends invited yet. Start sharing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
