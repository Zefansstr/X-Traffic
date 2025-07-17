import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, description } = body;

    // Update department
    const { data: updatedDepartment, error } = await supabase
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

    if (!updatedDepartment) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
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
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 