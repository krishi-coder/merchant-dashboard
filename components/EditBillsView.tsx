
import React, { useState } from 'react';
import { BillEntry } from '../types';
import { Check, X, Edit2, Trash2, Search, ChevronLeft, MoreVertical, Calendar, Database } from 'lucide-react';

interface EditBillsViewProps {
  bills: BillEntry[];
  onEdit: (updated: BillEntry) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const EditBillsView: React.FC<EditBillsViewProps> = ({ bills, onEdit, onDelete, onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BillEntry>>({});
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = bills.filter(b => 
    b.date === filterDate && 
    b.customerName.toLowerCase().includes(query.toLowerCase())
  );

  const save = () => {
    if (editingId && editForm.customerName && editForm.amount !== undefined) {
      onEdit(editForm as BillEntry);
      setEditingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      {/* Header with 3-dot Menu */}
      <div className="bg-[#202c33] px-3 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center">
          <ChevronLeft className="lg:hidden text-[#8696a0] mr-4 cursor-pointer" onClick={onBack} />
          <h3 className="font-semibold text-[#e9edef] text-[17px] leading-tight">
            {filterDate === new Date().toISOString().split('T')[0] ? "Today's Bills" : `Bills for ${filterDate}`}
          </h3>
        </div>
        <div className="relative">
          <MoreVertical className="text-[#8696a0] cursor-pointer" onClick={() => setShowMenu(!showMenu)} />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#233138] rounded-md shadow-2xl border border-[#2a3942] z-50 py-1 overflow-hidden">
              <button 
                className="w-full text-left px-4 py-3 hover:bg-[#182229] flex items-center text-sm text-[#e9edef]" 
                onClick={() => {
                  const d = prompt("Enter Custom Date (YYYY-MM-DD):", filterDate);
                  if (d) setFilterDate(d);
                  setShowMenu(false);
                }}
              >
                <Calendar size={16} className="mr-3 text-[#8696a0]" /> Custom Dates
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-[#111b21] border-b border-[#202c33]">
        <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-1.5">
          <Search size={16} className="text-[#8696a0] mr-3" />
          <input 
            placeholder="Search records..." 
            className="bg-transparent border-none text-sm w-full focus:outline-none text-[#e9edef]"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-sm text-[#e9edef] min-w-[500px]">
          <thead className="bg-[#182229] text-[11px] uppercase tracking-wider text-[#8696a0]">
            <tr>
              <th className="px-4 py-3 font-bold w-16">Status</th>
              <th className="px-4 py-3 font-bold">Party Name</th>
              <th className="px-4 py-3 font-bold">Amount</th>
              <th className="px-4 py-3 font-bold">Area</th>
              <th className="px-4 py-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222d34]">
            {filtered.map(bill => (
              <tr key={bill.id} className="hover:bg-[#202c33] transition-colors group">
                <td className="px-4 py-4">
                  <div className={`w-4 h-4 rounded shadow-sm flex items-center justify-center ${bill.type === 'customer' ? 'bg-[#00a884]' : 'bg-[#ef4444]'}`}>
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  </div>
                </td>
                <td className="px-4 py-4">
                  {editingId === bill.id ? (
                    <input className="bg-[#111b21] border border-[#3b4a54] rounded px-2 py-1 w-full text-xs" value={editForm.customerName} onChange={e => setEditForm({...editForm, customerName: e.target.value})} />
                  ) : (
                    <span className="font-semibold">{bill.customerName}</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {editingId === bill.id ? (
                    <input type="number" className="bg-[#111b21] border border-[#3b4a54] rounded px-2 py-1 w-full text-xs" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})} />
                  ) : (
                    <span className={bill.type === 'customer' ? 'text-[#00a884]' : 'text-[#ef4444]'}>₹{bill.amount.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${bill.status === 'staging' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                    {bill.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {editingId === bill.id ? (
                      <>
                        <button onClick={save} className="p-1 text-[#00a884] hover:bg-[#111b21] rounded"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-[#8696a0] hover:bg-[#111b21] rounded"><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(bill.id); setEditForm(bill); }} className="p-2 text-[#8696a0] hover:text-[#53bdeb] transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(bill.id)} className="p-2 text-[#8696a0] hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <Database size={40} className="text-[#202c33] mb-4" />
            <p className="text-[#8696a0] italic">No records for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};
