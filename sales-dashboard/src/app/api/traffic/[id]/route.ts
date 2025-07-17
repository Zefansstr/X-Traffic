import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Update traffic
    const { data: updatedTraffic, error } = await supabase
      .from('traffic')
      .update({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    if (!updatedTraffic) {
      return NextResponse.json(
        { success: false, error: 'Traffic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTraffic
    });
  } catch (error) {
    console.error('Error updating traffic:', error);
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
      .from('traffic')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Traffic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting traffic:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 