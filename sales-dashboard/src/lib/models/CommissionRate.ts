// CommissionRate interface untuk Supabase
export interface CommissionRate {
  id: string;
  agent_id?: string;
  game_id?: string;
  position: 'SE1' | 'SE2' | 'PE1' | 'PE2' | 'Manager';
  rate: number;
  tmt_rate: number;
  crt_rate: number;
  kpi_target: number;
  depositor_target: number;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default CommissionRate; 