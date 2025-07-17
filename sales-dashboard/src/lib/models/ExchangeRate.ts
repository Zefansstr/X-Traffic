// ExchangeRate interface untuk Supabase
export interface ExchangeRate {
  id: string;
  from_currency: 'USD' | 'IDR' | 'MYR';
  to_currency: 'USD' | 'IDR' | 'MYR';
  rate: number;
  date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default ExchangeRate; 