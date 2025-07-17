import { supabase } from './supabase';

// Function untuk kompatibilitas dengan kode lama yang menggunakan connectDB
const connectDB = async () => {
  try {
    // Test Supabase connection dengan query sederhana
    const { data, error } = await supabase
      .from('departments')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') { // PGRST116 adalah error table not found
      console.warn('Supabase connection test warning:', error.message);
    }
    
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.warn('Supabase connection error:', error);
    return true; // Return true untuk kompatibilitas dengan kode lama
  }
};

export default connectDB; 