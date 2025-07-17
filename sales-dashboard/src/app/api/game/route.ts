import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua game data
export async function GET() {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: games });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat game baru
export async function POST(request: NextRequest) {
  try {
    const { name, description, category } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Check if game with same name exists but is inactive
    const { data: existingGame } = await supabase
      .from('games')
      .select('*')
      .eq('name', name)
      .eq('is_active', false)
      .single();
    
    if (existingGame) {
      // Reactivate existing game
      const { data: updatedGame, error } = await supabase
        .from('games')
        .update({
          description,
          category,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGame.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedGame }, 
        { status: 200 }
      );
    }
    
    // Create new game
    const { data: newGame, error } = await supabase
      .from('games')
      .insert([{
        name,
        description,
        category,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json(
      { success: true, data: newGame }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game' }, 
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
    
    const { data: updatedGame, error } = await supabase
      .from('games')
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
      data: updatedGame,
      message: `Game ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating game status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update game status' }, 
      { status: 500 }
    );
  }
} 