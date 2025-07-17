import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// PATCH - Update sales existing menjadi depositor
export async function PATCH(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest
) {
  try {
    // Update semua sales yang sudah ada menjadi depositor (untuk testing)
    // Biasanya hanya beberapa sales saja yang depositor
    const { data, error } = await supabase
      .from('sales')
      .update({ 
        is_depositor: true,
        is_fda: true, // Set FDA juga untuk testing
        updated_at: new Date().toISOString()
      })
      .eq('status', 'closed')
      .eq('is_depositor', false) // yang belum depositor
      .select();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${data?.length || 0} sales updated as depositors`,
      modifiedCount: data?.length || 0
    });
  } catch (error) {
    console.error('Error updating sales as depositor:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update sales as depositor' 
    }, { status: 500 });
  }
} 