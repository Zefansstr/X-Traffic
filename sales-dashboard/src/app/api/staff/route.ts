import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua staff data
export async function GET() {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: staff });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat staff baru
export async function POST(request: NextRequest) {
  try {
    const { name, department_id, position, email, phone } = await request.json();
    
    // Validate required fields
    if (!name || !position) {
      return NextResponse.json(
        { success: false, error: 'Name and position are required' },
        { status: 400 }
      );
    }
    
    // Convert empty string to null for UUID fields, or use null if not provided
    const cleanDepartmentId = department_id === '' || department_id === undefined ? null : department_id;
    
    // Check if staff with same name exists but is inactive
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('*')
      .eq('name', name)
      .eq('is_active', false)
      .single();
    
    if (existingStaff) {
      // Reactivate existing staff
      const { data: updatedStaff, error } = await supabase
        .from('staff')
        .update({
          position,
          email,
          phone,
          department_id: cleanDepartmentId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStaff.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedStaff }, 
        { status: 200 }
      );
    }
    
    // Create new staff
    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert([{
        name,
        position,
        email,
        phone,
        department_id: cleanDepartmentId,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json(
      { success: true, data: newStaff }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff' }, 
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
    
    const { data: updatedStaff, error } = await supabase
      .from('staff')
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
      data: updatedStaff,
      message: `Staff ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating staff status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff status' }, 
      { status: 500 }
    );
  }
} 