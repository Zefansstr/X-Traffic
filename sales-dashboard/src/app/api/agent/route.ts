import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua agent data
export async function GET() {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    const response = NextResponse.json({ success: true, data: agents });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' }, 
      { status: 500 }
    );
  }
}

// POST - Membuat agent baru
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
    
    // Check if agent with same name exists but is inactive
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('name', name)
      .eq('is_active', false)
      .single();
    
    if (existingAgent) {
      // Reactivate existing agent
      const { data: updatedAgent, error } = await supabase
        .from('agents')
        .update({
          description,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAgent.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }
      
      return NextResponse.json(
        { success: true, data: updatedAgent }, 
        { status: 200 }
      );
    }
    
    // Create new agent
    const { data: newAgent, error } = await supabase
      .from('agents')
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
      { success: true, data: newAgent }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' }, 
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
    
    const { data: updatedAgent, error } = await supabase
      .from('agents')
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
      data: updatedAgent,
      message: `Agent ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent status' }, 
      { status: 500 }
    );
  }
} 