
import React, { useState, useRef } from 'react';
import { extractBillData } from '../services/geminiService';
import { BillEntry } from '../types';
import { Camera, Loader2, Save, X, Smile, Plus, Mic, Send } from 'lucide-react';

interface BillExtractorProps {
  onSave: (bill: BillEntry) => void;
}

export const BillExtractor: React.FC<BillExtractorProps> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<BillEntry> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        date: result.date || new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error processing bill');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (extractedData?.customerName && extractedData?.amount !== undefined) {
      // Fixed: Added missing 'type' and 'status' fields required by BillEntry
      onSave({
        id: crypto.randomUUID(),
        customerName: extractedData.customerName,
        amount: extractedData.amount,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        items: extractedData.items,
        imageUrl: image || undefined,
        timestamp: Date.now(),
        type: 'customer',
        status: 'staging'
      });
      setImage(null);
      setExtractedData(null);
    }
  };

  const clear = () => {
    setImage(null);
    setExtractedData(null);
  };

  return (
    <div className="h-full flex flex-col wa-bg">
      <div className="bg-[#ededed] px-4 py-2.5 border-b border-gray-300 flex items-center justify-between">
        <h3 className="font-semibold text-[#111b21]">Attach Document</h3>
        <X onClick={clear} className="text-gray-500 cursor-pointer" size={22} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md bg-white rounded-2xl p-10 text-center shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all group"
          >
            <div className="w-20 h-20 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#dcf8c6] transition-colors">
              <Camera className="text-gray-400 group-hover:text-[#075e54]" size={40} />
            </div>
            <h4 className="text-xl font-bold text-gray-800">New Bill Image</h4>
            <p className="text-gray-500 mt-2">Take a photo or upload a bill image</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[500px]">
            {/* Image Preview */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              <img src={image} alt="Bill" className="max-h-full max-w-full object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-xl flex items-center space-x-3 shadow-xl">
                    <Loader2 className="w-6 h-6 text-[#075e54] animate-spin" />
                    <span className="font-semibold text-gray-700">Analyzing bill...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fields / Caption style */}
            <div className="w-full lg:w-72 bg-white p-6 flex flex-col border-l border-gray-200">
              <h4 className="font-bold text-gray-700 mb-6 uppercase text-[11px] tracking-wider">Confirm Details</h4>
              
              {extractedData && (
                <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Customer</label>
                    <input 
                      type="text" 
                      value={extractedData.customerName || ''} 
                      onChange={e => setExtractedData({...extractedData, customerName: e.target.value})}
                      className="w-full border-b border-gray-300 py-1 text-sm focus:outline-none focus:border-[#25d366]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={extractedData.amount || ''} 
                      onChange={e => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})}
                      className="w-full border-b border-gray-300 py-1 text-sm focus:outline-none focus:border-[#25d366] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
                    <input 
                      type="date" 
                      value={extractedData.date || ''} 
                      onChange={e => setExtractedData({...extractedData, date: e.target.value})}
                      className="w-full border-b border-gray-300 py-1 text-sm focus:outline-none focus:border-[#25d366]"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#075e54] hover:bg-[#064e46] text-white py-3 rounded-lg font-bold flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Send className="mr-2" size={18} />
                Send to Log
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar mimic */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center space-x-4">
        <Smile size={24} className="text-gray-500" />
        <Plus size={24} className="text-gray-500" />
        <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-400">
          Add description...
        </div>
        <Mic size={24} className="text-gray-500" />
      </div>
    </div>
  );
};
