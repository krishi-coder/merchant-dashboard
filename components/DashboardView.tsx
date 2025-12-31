
import React, { useState } from 'react';
import { BillEntry } from '../types';
import { IndianRupee, Trash2, Edit2, Check, X, Phone, Video, Search, MoreVertical } from 'lucide-react';

interface DashboardViewProps {
  bills: BillEntry[];
  onDelete: (id: string) => void;
  onEdit: (updated: BillEntry) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ bills, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BillEntry>>({});

  const today = new Date().toISOString().split('T')[0];
  const todayBills = [...bills].filter(b => b.date === today).sort((a,b) => a.timestamp - b.timestamp);
  const totalDaily = todayBills.reduce((acc, curr) => acc + curr.amount, 0);

  const startEdit = (bill: BillEntry) => {
    setEditingId(bill.id);
    setEditForm(bill);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm.customerName && editForm.amount !== undefined) {
      onEdit(editForm as BillEntry);
      setEditingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col wa-bg">
      {/* Header Area */}
      <div className="bg-[#ededed] px-4 py-2 flex items-center justify-between border-b border-gray-300 shadow-sm z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center text-white mr-3">
            <span className="font-bold text-lg">D</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#111b21] leading-tight">Daily Transaction Log</h3>
            <p className="text-[11px] text-gray-500">Active Session</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Daily Total Prominent Display */}
          <div className="hidden sm:flex items-center bg-[#25d366] text-white px-3 py-1 rounded-full shadow-sm">
            <IndianRupee size={14} className="mr-0.5" />
            <span className="font-bold text-sm">{totalDaily.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6 text-gray-500">
            <Video size={20} className="cursor-pointer hover:text-gray-700" />
            <Phone size={20} className="cursor-pointer hover:text-gray-700" />
            <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>
            <Search size={20} className="cursor-pointer hover:text-gray-700" />
            <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" />
          </div>
        </div>
      </div>

      {/* Messages / Transaction Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-4 no-scrollbar">
        {/* Date Marker */}
        <div className="flex justify-center mb-6">
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-sm text-[12px] text-gray-500 uppercase font-medium">
            Today
          </span>
        </div>

        {/* Mobile Total View (Visible only on small screens) */}
        <div className="sm:hidden flex justify-center mb-4">
           <div className="bg-[#dcf8c6] px-4 py-1 rounded-full text-[#075e54] text-xs font-bold border border-black/5 shadow-sm">
             TOTAL TODAY: ₹{totalDaily.toLocaleString()}
           </div>
        </div>

        {todayBills.length === 0 ? (
          <div className="flex justify-center">
             <div className="bg-[#cfe9ba] px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600 border border-black/5">
                No transactions recorded for today. Send a bill to start!
             </div>
          </div>
        ) : (
          todayBills.map((bill, index) => {
            const isEditing = editingId === bill.id;
            return (
              <div key={bill.id} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                <div className={`${index % 2 === 0 ? 'chat-bubble-left' : 'chat-bubble-right'} max-w-[85%] min-w-[200px] p-3`}>
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-bold mb-1 ${index % 2 === 0 ? 'text-[#e542a3]' : 'text-[#075e54]'}`}>
                      {bill.customerName}
                    </span>
                    
                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <input 
                          type="text" 
                          value={editForm.customerName} 
                          onChange={e => setEditForm({...editForm, customerName: e.target.value})}
                          className="w-full text-sm bg-white/50 border-b border-gray-400 focus:outline-none"
                        />
                        <input 
                          type="number" 
                          value={editForm.amount} 
                          onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                          className="w-full text-sm bg-white/50 border-b border-gray-400 focus:outline-none"
                        />
                        <div className="flex justify-end space-x-2">
                          <button onClick={saveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[15px] text-[#111b21] flex items-center font-semibold">
                            ₹{bill.amount.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(bill)} className="p-1 text-gray-400 hover:text-blue-500">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => onDelete(bill.id)} className="p-1 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {bill.items && bill.items.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-black/5">
                            <p className="text-[11px] text-gray-500 font-medium">Items:</p>
                            <p className="text-[12px] text-gray-600 italic truncate">{bill.items.join(', ')}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-end items-center mt-1 space-x-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[#53bdeb]">
                        <Check size={14} className="-mr-1" />
                        <Check size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer Placeholder */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center space-x-4">
        <MoreVertical size={24} className="text-gray-500 cursor-not-allowed" />
        <div className="flex-1 bg-white rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed">
          Use "Add New Bill" from the sidebar to record transactions
        </div>
        <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center text-white cursor-not-allowed">
          <Search size={20} />
        </div>
      </div>
    </div>
  );
};
