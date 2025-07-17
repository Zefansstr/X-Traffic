import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua department data
export async function GET() {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: departments });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat department baru
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/departments - Request received');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, code, description } = body;
    
    // Validate required fields
    if (!name || !code) {
      console.log('Validation failed: missing name or code');
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }
    
    console.log('Creating department with:', { name, code, description });
    
    // Check if department with same name or code exists but is inactive
    console.log('Checking for existing inactive department...');
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('*')
      .or(`name.eq.${name},code.eq.${code}`)
      .eq('is_active', false)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing department:', checkError);
    }
    
    if (existingDept) {
      console.log('Found existing inactive department, reactivating...');
      // Reactivate existing department
      const { data: updatedDept, error } = await supabase
        .from('departments')
        .update({
          name,
          code,
          description,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDept.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedDept }, 
        { status: 200 }
      );
    }
    
    // Create new department
    console.log('Creating new department...');
    const { data: newDept, error } = await supabase
      .from('departments')
      .insert([{
        name,
        code,
        description,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      console.error('Error details:', { message: error.message, code: error.code, details: error.details });
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    console.log('Department created successfully:', newDept);
    
    return NextResponse.json(
      { success: true, data: newDept }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create department' }, 
      { status: 500 }
    );
  }
}

// PUT - Update existing department (full update)
export async function PUT(request: NextRequest) {
  try {
    const { id, name, code, description } = await request.json();
    
    // Validate required fields
    if (!id || !name || !code) {
      return NextResponse.json(
        { success: false, error: 'ID, name, and code are required' },
        { status: 400 }
      );
    }
    
    // Update department
    const { data: updatedDept, error } = await supabase
      .from('departments')
      .update({
        name,
        code,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json(
      { success: true, data: updatedDept }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update department' }, 
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
    
    const { data: updatedDept, error } = await supabase
      .from('departments')
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
      data: updatedDept,
      message: `Department ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating department status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update department status' }, 
      { status: 500 }
    );
  }
}

// DELETE - Hard delete department (permanent removal)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (checkError || !existingDept) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Perform hard delete
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(handleSupabaseError(deleteError), { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Department permanently deleted' 
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete department' }, 
      { status: 500 }
    );
  }
} 