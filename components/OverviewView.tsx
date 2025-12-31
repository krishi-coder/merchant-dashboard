
import React, { useState } from 'react';
import { BillEntry } from '../types';
import { Calendar, ChevronLeft, MoreVertical, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface OverviewViewProps {
  bills: BillEntry[];
  onBack: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ bills, onBack }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Calculate Weekly Data (Monday to Sunday)
  const getWeeklyStats = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ day, sales: 0, purchases: 0 }));
    
    bills.forEach(bill => {
      const d = new Date(bill.date);
      let dayIdx = d.getDay() - 1; // Mon = 0
      if (dayIdx < 0) dayIdx = 6; // Sun = 6
      if (dayIdx >= 0 && dayIdx < 7) {
        if (bill.type === 'customer') data[dayIdx].sales += bill.amount;
        else data[dayIdx].purchases += bill.amount;
      }
    });
    return data;
  };

  const weeklyData = getWeeklyStats();
  const maxVal = Math.max(...weeklyData.map(d => Math.max(d.sales, d.purchases)), 1000);

  const totalSales = weeklyData.reduce((a,c) => a + c.sales, 0);
  const totalPurchases = weeklyData.reduce((a,c) => a + c.purchases, 0);

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      <div className="bg-[#202c33] px-3 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center">
          <ChevronLeft className="lg:hidden text-[#8696a0] mr-4 cursor-pointer" onClick={onBack} />
          <h3 className="font-semibold text-[#e9edef] text-[17px]">Business overview</h3>
        </div>
        <div className="relative">
          <MoreVertical className="text-[#8696a0] cursor-pointer" onClick={() => setShowMenu(!showMenu)} />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#233138] rounded shadow-xl border border-[#2a3942] z-50 py-1">
              <button 
                className="w-full text-left px-4 py-3 hover:bg-[#182229] flex items-center text-sm text-[#e9edef]" 
                onClick={() => {
                  alert("Custom date range picker simulation.");
                  setShowMenu(false);
                }}
              >
                <Calendar size={16} className="mr-3 text-[#8696a0]" /> Custom Dates
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 no-scrollbar pb-24">
        {/* Weekly Sales Chart */}
        <div className="bg-[#111b21] p-6 rounded-3xl border border-[#2a3942] shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-[#e9edef] text-sm font-bold flex items-center">
              <TrendingUp size={18} className="mr-2 text-[#00a884]"/> Sales performance (Weekly)
            </h4>
            <span className="text-[10px] text-[#8696a0] font-bold uppercase tracking-widest px-2 py-1 bg-[#202c33] rounded">Mon - Sun</span>
          </div>
          
          <div className="flex items-end justify-between h-56 space-x-2 lg:px-6">
            {weeklyData.map(d => {
              const salesHeight = (d.sales / maxVal) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-[#202c33] border border-[#3b4a54] text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-2xl min-w-[80px] text-center pointer-events-none">
                    <p className="font-bold border-b border-[#3b4a54] mb-1">{d.day}</p>
                    <p className="text-[#00a884]">₹{d.sales.toLocaleString()}</p>
                  </div>

                  {/* Main Bar */}
                  <div 
                    className="w-full bg-[#00a884] rounded-t-md transition-all duration-700 hover:bg-[#00c99e] shadow-lg relative" 
                    style={{ height: `${Math.max(salesHeight, 3)}%` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-md" />
                  </div>
                  <span className="text-[11px] text-[#8696a0] mt-3 font-bold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#182229] p-5 rounded-3xl border border-[#2a3942] shadow-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-[#00a884]">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] text-[#8696a0] font-bold uppercase tracking-tighter">Weekly Sales Revenue</p>
              <p className="text-2xl font-black text-[#e9edef]">₹{totalSales.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#182229] p-5 rounded-3xl border border-[#2a3942] shadow-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-[#ef4444]">
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-[10px] text-[#8696a0] font-bold uppercase tracking-tighter">Weekly Purchases</p>
              <p className="text-2xl font-black text-[#e9edef]">₹{totalPurchases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#202c33] p-4 rounded-2xl border border-dashed border-[#3b4a54] text-center">
           <p className="text-[11px] text-[#8696a0]">
             Database currently contains <span className="text-white font-bold">{bills.filter(b => b.status === 'final').length}</span> finalized records.
           </p>
        </div>
      </div>
    </div>
  );
};
