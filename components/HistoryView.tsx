
import React, { useState } from 'react';
import { BillEntry } from '../types';
import { Search, Lock, FileText, Check, ChevronLeft, MoreVertical, Filter, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  bills: BillEntry[];
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ bills, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advFilters, setAdvFilters] = useState({ name: '', minAmount: 0, maxAmount: Infinity });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') setIsAuthenticated(true);
    else { alert('Wrong PIN. Hint: 1234'); setPassword(''); }
  };

  const filteredBills = bills.filter(bill => {
    const dateOk = (!fromDate || bill.date >= fromDate) && (!toDate || bill.date <= toDate);
    const nameOk = !advFilters.name || bill.customerName.toLowerCase().includes(advFilters.name.toLowerCase());
    const amountOk = bill.amount >= advFilters.minAmount && bill.amount <= advFilters.maxAmount;
    return dateOk && nameOk && amountOk;
  });

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col wa-bg">
        <div className="bg-[#202c33] px-3 py-4 flex items-center shadow-sm">
          <ChevronLeft className="lg:hidden text-[#8696a0] mr-4 cursor-pointer" onClick={onBack} />
          <h3 className="font-semibold text-[#e9edef] text-[17px]">Fetch History</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-[#111b21] p-8 rounded-3xl border border-[#2a3942] text-center w-full max-w-sm shadow-2xl">
            <Lock size={32} className="mx-auto mb-4 text-[#00a884]" />
            <h2 className="text-[#e9edef] text-xl font-bold mb-4">Merchant Vault</h2>
            <input type="password" maxLength={4} value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent border-b-2 border-[#00a884] text-center text-3xl tracking-widest text-white w-24 mb-6 focus:outline-none" autoFocus />
            <button className="w-full bg-[#00a884] py-3 rounded-xl font-bold text-white hover:bg-[#008069] transition-transform active:scale-95">Unlock Archive</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      <div className="bg-[#202c33] px-3 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center">
          <ChevronLeft className="lg:hidden text-[#8696a0] mr-4 cursor-pointer" onClick={onBack} />
          <h3 className="font-semibold text-[#e9edef] text-[17px]">Fetch bills</h3>
        </div>
        <div className="relative">
          <MoreVertical className="text-[#8696a0] cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)} />
          {showAdvanced && (
            <div className="absolute right-0 mt-2 w-72 bg-[#233138] rounded-xl shadow-2xl border border-[#2a3942] z-50 p-5 space-y-4">
              <h4 className="text-xs font-bold text-[#8696a0] uppercase flex items-center"><Filter size={12} className="mr-2"/> Advanced Search</h4>
              <div className="space-y-1">
                 <label className="text-[10px] text-[#8696a0] uppercase font-bold">Party Name</label>
                 <input placeholder="Ex: John Doe" className="w-full bg-[#111b21] rounded p-2.5 text-sm text-white focus:ring-1 ring-[#00a884] outline-none" value={advFilters.name} onChange={e => setAdvFilters({...advFilters, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#8696a0] uppercase font-bold">Amount Range (₹)</label>
                <div className="flex space-x-2">
                  <input type="number" placeholder="Min" className="w-1/2 bg-[#111b21] rounded p-2 text-sm text-white outline-none" value={advFilters.minAmount || ''} onChange={e => setAdvFilters({...advFilters, minAmount: parseFloat(e.target.value) || 0})} />
                  <input type="number" placeholder="Max" className="w-1/2 bg-[#111b21] rounded p-2 text-sm text-white outline-none" value={advFilters.maxAmount === Infinity ? '' : advFilters.maxAmount} onChange={e => setAdvFilters({...advFilters, maxAmount: parseFloat(e.target.value) || Infinity})} />
                </div>
              </div>
              <button onClick={() => setShowAdvanced(false)} className="w-full bg-[#00a884] text-white py-2.5 rounded-lg text-sm font-bold mt-2 shadow-lg hover:bg-[#008069]">Apply Advanced Filter</button>
            </div>
          )}
        </div>
      </div>

      {/* Date Selectors (Main UI) */}
      <div className="p-4 bg-[#111b21] border-b border-[#2a3942] flex items-center space-x-4">
        <div className="flex-1 bg-[#202c33] rounded-xl px-3 py-2 flex items-center">
          <div className="mr-3">
            <p className="text-[8px] font-bold text-[#8696a0] uppercase">From Date</p>
            <input type="date" className="bg-transparent text-sm text-white w-full focus:outline-none" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
        </div>
        <ArrowRight size={16} className="text-[#3b4a54] shrink-0" />
        <div className="flex-1 bg-[#202c33] rounded-xl px-3 py-2 flex items-center">
          <div className="mr-3">
            <p className="text-[8px] font-bold text-[#8696a0] uppercase">To Date</p>
            <input type="date" className="bg-transparent text-sm text-white w-full focus:outline-none" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34] no-scrollbar pb-20">
        {filteredBills.map(bill => (
          <div key={bill.id} className="px-5 py-4 flex items-center hover:bg-[#202c33] transition-colors border-l-4" style={{ borderLeftColor: bill.type === 'customer' ? '#00a884' : '#ef4444' }}>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white mr-4 shadow-lg ${bill.type === 'customer' ? 'bg-[#00a884]' : 'bg-[#ef4444]'}`}>
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className="font-semibold text-[#e9edef] truncate text-[16px]">{bill.customerName}</h4>
                <span className="text-[10px] text-[#8696a0] bg-[#202c33] px-1.5 py-0.5 rounded">{bill.date}</span>
              </div>
              <div className="flex items-center text-[13px] text-[#8696a0]">
                 <span className={bill.type === 'customer' ? 'text-[#00a884]' : 'text-red-400'}>₹{bill.amount.toLocaleString()}</span>
                 <span className="mx-2 opacity-30">•</span>
                 <span className="capitalize">{bill.type} bill</span>
              </div>
            </div>
            <Check size={16} className="text-[#53bdeb] ml-2" />
          </div>
        ))}
        {filteredBills.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 text-[#3b4a54]">
            <Search size={64} className="opacity-10 mb-4" />
            <p className="text-[#8696a0]">No records match these criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
