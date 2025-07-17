import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Update device
    const { data: updatedDevice, error } = await supabase
      .from('devices')
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

    if (!updatedDevice) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device:', error);
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
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 