import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, category } = body;

    // Update game
    const { data: updatedGame, error } = await supabase
      .from('games')
      .update({
        name,
        description,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    if (!updatedGame) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGame
    });
  } catch (error) {
    console.error('Error updating game:', error);
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
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 