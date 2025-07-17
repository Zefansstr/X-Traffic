import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua traffic data
export async function GET() {
  try {
    const { data: traffic, error } = await supabase
      .from('traffic')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: traffic });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching traffic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch traffic' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat traffic baru
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Check if traffic with same name exists but is inactive
    const { data: existingTraffic } = await supabase
      .from('traffic')
      .select('*')
      .eq('name', name)
      .eq('is_active', false)
      .single();
    
    if (existingTraffic) {
      // Reactivate existing traffic
      const { data: updatedTraffic, error } = await supabase
        .from('traffic')
        .update({
          description,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTraffic.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedTraffic }, 
        { status: 200 }
      );
    }
    
    // Create new traffic
    const { data: newTraffic, error } = await supabase
      .from('traffic')
      .insert([{
        name,
        description,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json(
      { success: true, data: newTraffic }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating traffic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create traffic' }, 
      { status: 500 }
    );
  }
}

// PATCH - Toggle active/inactive status
export async function PATCH(request: NextRequest) {
  try {
    const { id, is_active } = await request.json();
    
    if (!id || is_active === undefined) {
      return NextResponse.json(
        { success: false, error: 'ID and is_active status are required' },
        { status: 400 }
      );
    }
    
    const { data: updatedTraffic, error } = await supabase
      .from('traffic')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedTraffic,
      message: `Traffic ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating traffic status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update traffic status' }, 
      { status: 500 }
    );
  }
} 