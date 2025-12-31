
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DailyLogView } from './components/DailyLogView';
import { HistoryView } from './components/HistoryView';
import { EditBillsView } from './components/EditBillsView';
import { OverviewView } from './components/OverviewView';
import { ViewType, BillEntry } from './types';

const STORAGE_KEY = 'cloth_merchant_bills_v5';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType | null>('upload-customer');
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBills(JSON.parse(saved));
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  const addBill = (bill: BillEntry) => {
    setBills(prev => [bill, ...prev]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const updateBill = (updated: BillEntry) => {
    setBills(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const finalizeBill = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'final' as const } : b));
  };

  const finalizeAllToday = (type: 'customer' | 'vendor') => {
    const today = new Date().toISOString().split('T')[0];
    setBills(prev => prev.map(b => 
      (b.date === today && b.type === type && b.status === 'staging') 
      ? { ...b, status: 'final' as const } 
      : b
    ));
  };

  const renderActiveChat = () => {
    if (!activeView) return null;
    
    switch (activeView) {
      case 'upload-customer':
        return (
          <DailyLogView 
            bills={bills.filter(b => b.type === 'customer')} 
            onSave={addBill} 
            onDelete={deleteBill} 
            onFinalize={finalizeBill}
            onFinalizeAll={() => finalizeAllToday('customer')}
            type="customer" 
            onBack={() => setActiveView(null)} 
          />
        );
      case 'upload-vendor':
        return (
          <DailyLogView 
            bills={bills.filter(b => b.type === 'vendor')} 
            onSave={addBill} 
            onDelete={deleteBill} 
            onFinalize={finalizeBill}
            onFinalizeAll={() => finalizeAllToday('vendor')}
            type="vendor" 
            onBack={() => setActiveView(null)} 
          />
        );
      case 'edit-bills':
        return <EditBillsView bills={bills} onEdit={updateBill} onDelete={deleteBill} onBack={() => setActiveView(null)} />;
      case 'fetch-bills':
        return <HistoryView bills={bills} onBack={() => setActiveView(null)} />;
      case 'overview':
        return <OverviewView bills={bills} onBack={() => setActiveView(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b141a] overflow-hidden select-none">
      <div className={`
        ${isMobile && activeView ? 'hidden' : 'flex'}
        flex-col h-full w-full lg:w-[400px] border-r border-[#222d34]
      `}>
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          bills={bills}
        />
      </div>

      <div className={`
        ${isMobile && !activeView ? 'hidden' : 'flex'}
        flex-1 flex-col h-full relative min-w-0
      `}>
        {activeView ? (
          renderActiveChat()
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full wa-bg text-center p-10">
            <div className="w-24 h-24 mb-6 opacity-20 text-[#e9edef]">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.408 2.438 1.103 3.394l-1.103 4.027 4.148-1.089c.92.589 2.013.935 3.187.935 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.321 8.216c-.146.411-.734.757-1.018.8-.261.04-.616.072-1.222-.169-.747-.297-1.231-.772-1.782-1.325-.808-.809-1.354-1.791-1.354-2.883 0-.395.105-.761.306-1.08.318-.495 1.054-.582 1.408-.582.115 0 .22.001.311.005.241.012.361.028.519.387l.471 1.096c.074.171.123.284.025.48-.098.196-.147.327-.294.49-.147.163-.311.359-.441.482-.146.13-.298.273-.129.563.171.291.758 1.248 1.626 2.023.639.57 1.173.746 1.464.887.291.14.463.117.635-.082.171-.2.742-.861.94-.155.197.706.394 1.567.427 1.632.033.065.066.141-.013.363z"/></svg>
            </div>
            <h1 className="text-3xl font-light text-[#e9edef] mb-3">Merchant Hub</h1>
            <p className="text-[#8696a0] max-w-sm text-sm leading-relaxed">
              Log transactions, track inventory, and view insights. Powered by Google Gemini AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
