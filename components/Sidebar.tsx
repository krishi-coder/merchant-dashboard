
import React, { useState } from 'react';
import { ViewType, BillEntry } from '../types';
import { 
  MoreVertical,
  Search, 
  Star,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Edit3,
  FileSearch,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewType | null;
  onViewChange: (view: ViewType) => void;
  bills: BillEntry[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, bills }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  const customerStagingCount = bills.filter(b => b.type === 'customer' && b.status === 'staging').length;
  const vendorStagingCount = bills.filter(b => b.type === 'vendor' && b.status === 'staging').length;

  // Added explicit typing to module structure to fix 'badge' property errors
  const chatModules: {
    id: ViewType;
    name: string;
    lastMsg: string;
    time: string;
    color: string;
    icon: any;
    badge?: number;
  }[] = [
    { 
      id: 'upload-customer', 
      name: 'Customer Sales', 
      lastMsg: customerStagingCount > 0 ? `${customerStagingCount} pending uploads` : 'No pending entries', 
      time: 'ONLINE',
      color: 'bg-[#00a884]',
      icon: ArrowUpRight,
      badge: customerStagingCount 
    },
    { 
      id: 'upload-vendor', 
      name: 'Vendor Purchases', 
      lastMsg: vendorStagingCount > 0 ? `${vendorStagingCount} pending uploads` : 'Ready to scan', 
      time: '8:45 AM', 
      color: 'bg-[#ef4444]',
      icon: ArrowDownLeft,
      badge: vendorStagingCount
    },
    { 
      id: 'edit-bills', 
      name: 'Edit entries', 
      lastMsg: 'Edit or Delete Entries', 
      time: 'Yesterday', 
      color: 'bg-[#53bdeb]',
      icon: Edit3 
    },
    { 
      id: 'fetch-bills', 
      name: 'Secure Vault', 
      lastMsg: 'History & Archive', 
      time: 'Monday', 
      color: 'bg-[#e542a3]',
      icon: FileSearch 
    },
    { 
      id: 'overview', 
      name: 'Business Insights', 
      lastMsg: 'Sales performance', 
      time: 'Weekly', 
      color: 'bg-[#ffbc38]',
      icon: TrendingUp 
    },
  ];

  const filteredModules = chatModules.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#111b21]">
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#3b4a54] rounded-full flex items-center justify-center overflow-hidden cursor-pointer shadow-lg border border-white/5">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Merchant&backgroundColor=202c33" alt="Merchant" />
          </div>
          <div className="ml-3 hidden sm:block">
            <p className="text-[13px] font-bold text-[#e9edef] leading-tight">Merchant Pro</p>
            <p className="text-[10px] text-[#00a884] font-bold">Authenticated</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-[#aebac1]">
          <MoreVertical 
            size={22} 
            className="cursor-pointer hover:text-white transition-colors" 
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#233138] rounded shadow-2xl border border-[#2a3942] z-50 py-1 animate-in fade-in slide-in-from-top-2 origin-top-right">
                <button 
                  className="w-full text-left px-4 py-3 hover:bg-[#182229] flex items-center text-sm text-[#e9edef]"
                  onClick={() => {
                    if (confirm("Are you sure you want to exit?")) window.location.reload();
                    setShowMenu(false);
                  }}
                >
                  <LogOut size={16} className="mr-3 text-[#8696a0]" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-2 space-x-3 border border-white/5 focus-within:ring-1 ring-[#00a884]">
          <Search size={18} className="text-[#8696a0]" />
          <input 
            type="text" 
            placeholder="Search for a feature" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-[14px] w-full text-[#e9edef] placeholder-[#8696a0]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-4 py-2 flex items-center justify-between text-[#8696a0]">
          <span className="text-[12px] font-bold tracking-widest uppercase">Modules</span>
          <ChevronDown size={14} />
        </div>
        
        {filteredModules.map((chat) => {
          const isActive = activeView === chat.id;
          const Icon = chat.icon;
          return (
            <div 
              key={chat.id}
              onClick={() => onViewChange(chat.id as ViewType)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-[#222d34] hover:bg-[#202c33] ${isActive ? 'bg-[#2a3942]' : ''}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mr-4 shrink-0 shadow-sm ${chat.color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[16px] font-normal text-[#e9edef] truncate">{chat.name}</h3>
                  <span className={`text-[11px] ${isActive ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[13px] text-[#8696a0] truncate leading-tight mr-2">{chat.lastMsg}</p>
                  {chat.badge ? (
                    <span className="bg-[#00a884] text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-lg">
                      {chat.badge}
                    </span>
                  ) : isActive && <Star size={12} className="text-[#ffbc38]" fill="currentColor" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
