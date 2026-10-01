import React from "react";
import { Home, PlayCircle, MessageSquare, Compass, User } from "lucide-react";

export type InstagramTab = 'feed' | 'reels' | 'messages' | 'explore' | 'profile';

interface InstagramBottomNavProps {
  activeTab: InstagramTab;
  onTabChange: (tab: InstagramTab) => void;
  userPhotoURL?: string;
  unreadMessagesCount?: number;
}

export const InstagramBottomNav: React.FC<InstagramBottomNavProps> = ({
  activeTab,
  onTabChange,
  userPhotoURL,
  unreadMessagesCount = 0
}) => {
  const tabs = [
    { id: 'feed' as InstagramTab, label: 'হোম', icon: Home },
    { id: 'reels' as InstagramTab, label: 'ক্লিপস', icon: PlayCircle },
    { id: 'messages' as InstagramTab, label: 'চ্যাট', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'explore' as InstagramTab, label: 'এক্সপ্লোর', icon: Compass },
    { id: 'profile' as InstagramTab, label: 'প্রোফাইল', isProfile: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-3 pt-1 max-w-lg mx-auto md:max-w-xl">
      <nav className="bg-[#131b26]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isProfile) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-center min-w-[56px] min-h-[44px] cursor-pointer active:scale-95 ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="প্রোফাইল"
              >
                <div className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#131b26]' : 'ring-1 ring-white/20'
                }`}>
                  {userPhotoURL ? (
                    <img src={userPhotoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center text-white">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3 py-1.5 rounded-xl transition-all duration-150 flex flex-col items-center justify-center min-w-[56px] min-h-[44px] cursor-pointer active:scale-95 ${
                isActive 
                  ? 'text-emerald-400 bg-emerald-500/10 font-bold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={tab.label}
            >
              <div className="relative">
                {Icon && <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'stroke-[1.8]'}`} />}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-emerald-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
