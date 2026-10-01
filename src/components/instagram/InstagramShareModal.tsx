import React, { useState } from "react";
import { X, Search, Check, Send } from "lucide-react";

interface ContactShareItem {
  id: string;
  displayName: string;
  username: string;
  photoURL?: string;
}

interface InstagramShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContent: any;
  contacts: ContactShareItem[];
  onSendDirect: (targetUserId: string, message: string) => void;
}

export const InstagramShareModal: React.FC<InstagramShareModalProps> = ({
  isOpen,
  onClose,
  targetContent,
  contacts,
  onSendDirect
}) => {
  const [search, setSearch] = useState("");
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSend = (contactId: string) => {
    const text = targetContent?.caption 
      ? `পোস্ট শেয়ার করা হয়েছে:\n"${targetContent.caption.slice(0, 60)}..."` 
      : "পোস্ট শেয়ার করা হয়েছে!";
    onSendDirect(contactId, text);
    setSentIds(prev => ({ ...prev, [contactId]: true }));
  };

  const filteredContacts = contacts.filter(c =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-xs flex flex-col justify-end max-w-lg mx-auto md:max-w-xl font-sans">
      <div className="bg-[#131b26] border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
        <div className="pt-2 pb-3 px-4 border-b border-white/10 flex items-center justify-between relative">
          <h3 className="font-bold text-sm mx-auto text-white">শেয়ার করুন (Direct)</h3>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors absolute right-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Contact */}
        <div className="p-3 border-b border-white/5 bg-[#0e1622]">
          <div className="bg-[#131b26] rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5 focus-within:border-emerald-500/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাকে পাঠাবেন খুঁজুন..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {filteredContacts.map(contact => {
            const isSent = sentIds[contact.id];

            return (
              <div key={contact.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e293b]">
                    <img 
                      src={contact.photoURL || `https://ui-avatars.com/api/?name=${contact.displayName}&background=1e293b&color=fff`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white">{contact.displayName}</h4>
                    <p className="text-[10px] text-slate-400">@{contact.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSend(contact.id)}
                  disabled={isSent}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isSent 
                      ? 'bg-white/10 text-slate-400' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black font-bold'
                  }`}
                >
                  {isSent ? "পাঠানো হয়েছে ✓" : "পাঠান"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
