// Department interface untuk Supabase
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default Department; 