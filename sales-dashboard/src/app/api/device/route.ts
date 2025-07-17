import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua device data
export async function GET() {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: devices });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat device baru
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
    
    // Check if device with same name exists but is inactive
    const { data: existingDevice } = await supabase
      .from('devices')
      .select('*')
      .eq('name', name)
      .eq('is_active', false)
      .single();
    
    if (existingDevice) {
      // Reactivate existing device
      const { data: updatedDevice, error } = await supabase
        .from('devices')
        .update({
          description,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDevice.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedDevice }, 
        { status: 200 }
      );
    }
    
    // Create new device
    const { data: newDevice, error } = await supabase
      .from('devices')
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
      { success: true, data: newDevice }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create device' }, 
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
    
    const { data: updatedDevice, error } = await supabase
      .from('devices')
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
      data: updatedDevice,
      message: `Device ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating device status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device status' }, 
      { status: 500 }
    );
  }
} 