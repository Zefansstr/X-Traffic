// Sales interface untuk Supabase
export interface Sale {
  id: string;
  agent_id?: string;
  game_id?: string;
  device_id?: string;
  staff_id?: string;
  depositor?: string;
  customer_name?: string;
  amount: number;
  commission?: number;
  date: string;
  time?: string;
  currency: string;
  type: string;
  status: 'pending' | 'closed' | 'cancelled';
  notes?: string;
  is_depositor: boolean;
  is_fda: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export type { Sale as Sales };
export default Sale; 