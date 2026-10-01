import React from "react";
import { Plus } from "lucide-react";
import { InstagramStory } from "../../types/instagram";

interface InstagramStoriesTrayProps {
  stories: InstagramStory[];
  currentUserPhoto?: string;
  onOpenStory: (storyId: string) => void;
  onCreateStory: () => void;
}

export const InstagramStoriesTray: React.FC<InstagramStoriesTrayProps> = ({
  stories,
  currentUserPhoto,
  onOpenStory,
  onCreateStory
}) => {
  return (
    <div className="px-3 py-3 border-b border-white/5 bg-[#0b1017]">
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar">
        {/* 1. User Story (Circular Frame with Plus) */}
        <div 
          onClick={onCreateStory}
          className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-slate-500 group-hover:border-emerald-400 transition-colors">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1e293b]">
              <img 
                src={currentUserPhoto || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"} 
                alt="Your story" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 text-black rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-[#0b1017] shadow-sm">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-300 truncate max-w-[72px]">
            আপনার স্টোরি
          </span>
        </div>

        {/* 2. Friends' Stories (Circular Frame with Gradient Ring) */}
        {stories.map(story => (
          <div 
            key={story.id}
            onClick={() => onOpenStory(story.id)}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group active:scale-95 transition-transform"
          >
            {/* Circular Frame with Story Ring */}
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all shadow-sm">
              <div className="w-full h-full rounded-full overflow-hidden p-[2px] bg-[#0b1017]">
                <img 
                  src={story.authorPhotoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt={story.authorUsername} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-200 truncate max-w-[72px]">
              {story.authorUsername}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
