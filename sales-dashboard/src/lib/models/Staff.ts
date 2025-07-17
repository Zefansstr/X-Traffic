// Staff interface untuk Supabase
export interface Staff {
  id: string;
  name: string;
  department_id?: string;
  position: 'SE1' | 'SE2' | 'PE1' | 'PE2' | 'Manager';
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default Staff; 