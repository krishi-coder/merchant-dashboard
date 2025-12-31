
export interface BillEntry {
  id: string;
  customerName: string;
  amount: number;
  date: string; // ISO format (YYYY-MM-DD)
  items?: string[];
  imageUrl?: string;
  timestamp: number;
  type: 'customer' | 'vendor';
  status: 'staging' | 'final';
}

export type ViewType = 
  | 'upload-customer' 
  | 'edit-bills' 
  | 'fetch-bills' 
  | 'upload-vendor' 
  | 'overview';

export interface ExtractionResult {
  customerName: string;
  amount: number;
  items?: string[];
  date?: string;
}
