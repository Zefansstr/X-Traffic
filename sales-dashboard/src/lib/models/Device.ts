// Device interface untuk Supabase
export interface Device {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default Device; 