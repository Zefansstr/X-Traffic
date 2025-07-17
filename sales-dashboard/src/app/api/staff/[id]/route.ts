import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Staff } from '@/lib/models/Staff';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, department_id, position, email, phone } = body;

    // Convert empty string to null for UUID fields, or use null if not provided
    const cleanDepartmentId = department_id === '' || department_id === undefined ? null : department_id;

    // Update staff
    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update({
        name,
        department_id: cleanDepartmentId,
        position,
        email,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    if (!updatedStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStaff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Hard delete - actually remove from database
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 