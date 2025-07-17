import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE - Menghapus sales data by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Sale ID is required'
      }, { status: 400 });
    }
    
    console.log('Deleting sale with ID:', id);
    
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Sale deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update sales data by ID  
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Sale ID is required'
      }, { status: 400 });
    }
    
    console.log('Updating sale with ID:', id, 'body:', body);
    
    const updateData: any = {
      customer_name: body.customerName,
      phone: body.phone,
      amount: parseFloat(body.amount),
      staff_id: body.staff,
      agent_id: body.agent,
      department: body.department,
    };
    
    if (body.device) updateData.device_id = body.device;
    if (body.game) updateData.game_id = body.game;
    if (body.traffic) updateData.traffic_id = body.traffic;
    if (body.notes) updateData.notes = body.notes;
    
    const { data, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Sale updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 