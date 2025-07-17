// Game interface untuk Supabase
export interface Game {
  id: string;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Export default untuk kompatibilitas
export default Game; 