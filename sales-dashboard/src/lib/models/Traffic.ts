// Traffic interface untuk Supabase
export interface Traffic {
  id: string;
  name: string;
  source?: string;
  medium?: string;
  campaign?: string;
  clicks: number;
  visits: number;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default Traffic; 