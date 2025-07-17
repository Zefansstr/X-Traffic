import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET - Mengambil semua sales data dengan JOIN
export async function GET() {
  try {
    console.log('🔍 GET /api/sales - Starting fetch...');
    
    // First get sales data
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        id,
        customer_name,
        phone,
        amount,
        department,
        staff_id,
        agent_id,
        traffic_id,
        device_id,
        game_id,
        notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching sales:', error);
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    console.log(`📊 Found ${sales?.length || 0} sales records`);

    // Get related data in parallel
    const [staffData, agentData, trafficData, deviceData, gameData] = await Promise.all([
      supabase.from('staff').select('id, name'),
      supabase.from('agents').select('id, name'), 
      supabase.from('traffic').select('id, name'),
      supabase.from('devices').select('id, name'),
      supabase.from('games').select('id, name')
    ]);

    // Create lookup maps
    const staffMap = new Map((staffData.data || []).map(s => [s.id, s.name]));
    const agentMap = new Map((agentData.data || []).map(a => [a.id, a.name]));
    const trafficMap = new Map((trafficData.data || []).map(t => [t.id, t.name]));
    const deviceMap = new Map((deviceData.data || []).map(d => [d.id, d.name]));
    const gameMap = new Map((gameData.data || []).map(g => [g.id, g.name]));

    // Transform data with proper names
    const transformedSales = sales?.map(sale => ({
      _id: sale.id,
      customerName: sale.customer_name,
      phone: sale.phone,
      amount: sale.amount,
      type: sale.department || 'TMT',
      status: 'closed',
      staffId: { 
        _id: sale.staff_id, 
        name: staffMap.get(sale.staff_id) || 'Unknown Staff' 
      },
      agentId: { 
        _id: sale.agent_id, 
        name: agentMap.get(sale.agent_id) || 'Unknown Agent' 
      },
      trafficId: { 
        _id: sale.traffic_id || '', 
        name: sale.traffic_id ? (trafficMap.get(sale.traffic_id) || 'Unknown Traffic') : '-' 
      },
      deviceId: { 
        _id: sale.device_id || '', 
        name: sale.device_id ? (deviceMap.get(sale.device_id) || 'Unknown Device') : '-' 
      },
      gameId: { 
        _id: sale.game_id || '', 
        name: sale.game_id ? (gameMap.get(sale.game_id) || 'Unknown Game') : '-' 
      },
      date: sale.created_at,
      notes: sale.notes,
      createdAt: sale.created_at,
      amountInMYR: sale.amount,
      currency: 'MYR'
    })) || [];

    console.log(`✅ Transformed ${transformedSales.length} sales records`);

    return NextResponse.json({ 
      success: true, 
      data: transformedSales 
    });
  } catch (error) {
    console.error('❌ Error fetching sales:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sales',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Membuat sales data baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 POST /api/sales - Received body:', body);
    
    // Validate required fields
    if (!body.customerName || !body.amount || 
        !body.staff || !body.agent || !body.department) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: 'customerName, amount, staff, agent, department are required'
      }, { status: 400 });
    }
    
    // First check if the provided staff_id and agent_id are valid UUIDs
    const isValidUUID = (str: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };
    
    if (!isValidUUID(body.staff) || !isValidUUID(body.agent)) {
      console.log('❌ UUID validation failed');
      return NextResponse.json({
        success: false,
        error: 'Invalid staff_id or agent_id format. Must be valid UUID.',
        details: `staff: ${body.staff}, agent: ${body.agent}`
      }, { status: 400 });
    }
    
    // Complete sales data with all required fields
    const saleData: any = {
      staff_id: body.staff,
      agent_id: body.agent,
      amount: parseFloat(body.amount),
      customer_name: body.customerName,
      phone: body.phone,
      department: body.department,
    };
    
    // Add optional fields
    if (body.device) saleData.device_id = body.device;
    if (body.game) saleData.game_id = body.game;
    if (body.traffic) saleData.traffic_id = body.traffic;
    if (body.notes) saleData.notes = body.notes;
    
    console.log('📝 Created sale object:', saleData);
    
    // Try to insert with the correct structure
    const { data: newSale, error } = await supabase
      .from('sales')
      .insert([saleData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      
      // If still failing due to missing columns, suggest fix
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Missing table columns. Please fix table structure first.',
          suggestion: 'Visit http://localhost:3000/api/fix-sales-table and send POST request to fix table structure',
          details: error.message
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Sale saved successfully:', newSale);
    
    return NextResponse.json({ success: true, data: newSale }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 

 