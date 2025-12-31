
import React, { useState, useRef, useEffect } from 'react';
import { BillEntry } from '../types';
import { extractBillData } from '../services/geminiService';
import { 
  Check, 
  X, 
  Camera, 
  Smile, 
  Plus, 
  Mic, 
  Loader2,
  Send,
  ChevronLeft,
  Clock,
  MoreVertical,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

interface DailyLogViewProps {
  bills: BillEntry[];
  onSave: (bill: BillEntry) => void;
  onDelete: (id: string) => void;
  onFinalize: (id: string) => void;
  onFinalizeAll: () => void;
  type: 'customer' | 'vendor';
  onBack: () => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({ 
  bills, onSave, onDelete, onFinalize, onFinalizeAll, type, onBack 
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<BillEntry> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date === today).sort((a,b) => a.timestamp - b.timestamp);
  const stagingCount = todayBills.filter(b => b.status === 'staging').length;
  const totalAmount = todayBills.reduce((acc, curr) => acc + curr.amount, 0);

  const isVendor = type === 'vendor';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bills, image]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    try {
      const result = await extractBillData(base64);
      setExtractedData({
        customerName: result.customerName,
        amount: result.amount,
        items: result.items,
        date: result.date || today
      });
    } catch (err) {
      alert('AI Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmSave = () => {
    if (extractedData?.customerName && extractedData?.amount !== undefined) {
      onSave({
        id: crypto.randomUUID(),
        customerName: extractedData.customerName,
        amount: extractedData.amount,
        date: extractedData.date || today,
        items: extractedData.items,
        imageUrl: image || undefined,
        timestamp: Date.now(),
        type,
        status: 'staging'
      });
      setImage(null);
      setExtractedData(null);
    }
  };

  return (
    <div className="h-full flex flex-col wa-bg">
      <div className="bg-[#202c33] px-3 py-3 flex items-center shadow-sm z-20">
        <ChevronLeft className="lg:hidden text-[#8696a0] mr-4 cursor-pointer" onClick={onBack} />
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-[#3b4a54] shrink-0">
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${type === 'customer' ? 'C' : 'V'}&backgroundColor=${type === 'customer' ? '00a884' : 'ef4444'}`} 
            alt="Type" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#e9edef] text-[16px] leading-tight truncate">
            {type === 'customer' ? 'Customer Daily Log' : 'Vendor Ledger'}
          </h3>
          <p className="text-[11px] text-[#8696a0] flex items-center mt-0.5 truncate">
            {stagingCount > 0 ? `${stagingCount} bills in staging` : 'All finalized'}
          </p>
        </div>
        <div className="flex items-center space-x-5 text-[#aebac1] ml-2">
          {stagingCount > 0 && (
            <button 
              onClick={onFinalizeAll}
              className="text-[11px] font-bold bg-[#00a884]/20 text-[#00a884] px-2 py-1 rounded hover:bg-[#00a884]/30 transition-colors"
            >
              FINAL ALL
            </button>
          )}
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:px-32 space-y-4 no-scrollbar">
        {/* System Summary Message */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#182229] px-4 py-2 rounded-lg shadow-sm text-[12px] text-[#8696a0] text-center border border-white/5 max-w-sm">
            <p className="font-bold text-[#e9edef] mb-1">SESSION SUMMARY: {today}</p>
            <p>Total recorded: <span className="text-[#00a884] font-bold">₹{totalAmount.toLocaleString()}</span></p>
            <p className="mt-1 opacity-70">Messages are end-to-end encrypted for your business.</p>
          </div>
        </div>

        {todayBills.length === 0 && !image && (
          <div className="flex justify-center pt-20">
            <div className="bg-[#202c33] px-6 py-4 rounded-xl text-center shadow-xl border border-white/5 max-w-xs">
              <Camera size={40} className="mx-auto text-[#3b4a54] mb-3" />
              <p className="text-[#e9edef] text-sm font-semibold">No bills yet today</p>
              <p className="text-[#8696a0] text-xs mt-1 leading-relaxed">Tap the camera icon below to scan a hard-copy bill and auto-extract details.</p>
            </div>
          </div>
        )}

        {todayBills.map((bill, idx) => {
          const isStaging = bill.status === 'staging';
          return (
            <div key={bill.id} className={`flex justify-start animate-in fade-in slide-in-from-bottom-1 duration-300`}>
              <div 
                className={`chat-bubble-left max-w-[85%] min-w-[200px] p-2 pr-12 relative shadow-md border-l-4 ${isVendor ? 'border-red-500' : 'border-[#00a884]'} ${isStaging ? 'bg-[#2a2f32]' : ''}`}
              >
                <div className="flex flex-col">
                  <span className={`text-[12px] font-bold mb-0.5 ${isVendor ? 'text-red-400' : 'text-[#ffbc38]'}`}>
                    {bill.customerName}
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-[17px] text-[#e9edef] font-semibold">
                      ₹{bill.amount.toLocaleString()}
                    </span>
                    {bill.items && bill.items.length > 0 && (
                       <span className="text-[11px] text-[#8696a0] italic truncate max-w-[100px]">
                         ({bill.items.length} items)
                       </span>
                    )}
                  </div>
                  
                  {isStaging && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-yellow-500 font-bold uppercase flex items-center">
                        <AlertCircle size={10} className="mr-1" /> Pending
                      </span>
                      <button 
                        onClick={() => onFinalize(bill.id)}
                        className="text-[10px] bg-[#00a884] text-white px-2 py-0.5 rounded font-bold hover:bg-[#008069]"
                      >
                        FINALIZE
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
                  <span className="text-[10px] text-[#8696a0]">
                    {new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={isStaging ? 'text-[#8696a0]' : 'text-[#53bdeb]'}>
                    <CheckCheck size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {image && (
          <div className="flex justify-start animate-in fade-in zoom-in-95 duration-200">
            <div className="chat-bubble-left max-w-[300px] p-2 shadow-2xl bg-[#202c33]">
              <div className="rounded-lg overflow-hidden bg-black/40 aspect-square flex items-center justify-center relative border border-white/5">
                <img src={image} alt="Draft Bill" className="max-h-full max-w-full object-contain" />
                {loading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <Loader2 size={28} className="text-[#00a884] animate-spin mb-2" />
                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">Analyzing...</span>
                  </div>
                )}
              </div>
              
              {extractedData && !loading && (
                <div className="mt-2 p-3 bg-[#111b21] rounded-lg space-y-3 border border-[#2a3942] animate-in slide-in-from-top-2">
                  <div>
                    <p className="text-[9px] text-[#8696a0] font-bold uppercase mb-1">Verify Party Name</p>
                    <input 
                      className="w-full bg-transparent text-sm text-[#e9edef] border-b border-[#2a3942] pb-1 focus:border-[#00a884] outline-none" 
                      value={extractedData.customerName} 
                      onChange={e => setExtractedData({...extractedData, customerName: e.target.value})} 
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1">
                      <p className="text-[9px] text-[#8696a0] font-bold uppercase mb-1">Total Amount (₹)</p>
                      <input 
                        type="number" 
                        className="w-full bg-transparent text-lg font-bold text-[#e9edef] focus:text-[#00a884] outline-none" 
                        value={extractedData.amount} 
                        onChange={e => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})} 
                      />
                    </div>
                    <button 
                      onClick={confirmSave} 
                      className={`w-10 h-10 ${isVendor ? 'bg-red-600' : 'bg-[#00a884]'} text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition-transform`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
              <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 p-1.5 bg-[#ef4444] text-white rounded-full shadow-lg border-2 border-[#0b141a]"><X size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#202c33] px-3 py-2 flex items-center space-x-3 pb-6 border-t border-white/5">
        <div className="flex items-center space-x-4 px-2">
          <Smile size={24} className="text-[#8696a0] cursor-pointer hover:text-[#e9edef] transition-colors" />
          <Plus size={24} className="text-[#8696a0] cursor-pointer hover:text-[#e9edef] transition-colors" />
        </div>
        <div className="flex-1 bg-[#2a3942] rounded-full flex items-center px-4 py-2.5 shadow-inner">
          <input 
            type="text" 
            placeholder="Scan bill hard copy..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-[#e9edef] placeholder-[#8696a0]" 
            readOnly 
          />
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-11 h-11 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Camera size={22} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      </div>
    </div>
  );
};
