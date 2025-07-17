import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '2025-07-15'
    const endDate = searchParams.get('endDate') || '2025-07-17'
    const staffId = searchParams.get('staffId')
    
    console.log('🔍 Debug Overall Report');
    console.log('Date range:', startDate, 'to', endDate);
    console.log('Staff filter:', staffId);
    
    // Test 1: Raw sales data with date filter and optional staff filter
    let query = supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate + 'T00:00:00')
      .lt('created_at', endDate + 'T23:59:59');

    if (staffId && staffId !== 'all') {
      query = query.eq('staff_id', staffId);
    }

    const { data: rawSales, error: rawError } = await query;
    
    if (rawError) {
      console.error('❌ Raw sales query failed:', rawError);
      return NextResponse.json({
        success: false,
        test: 'raw_sales',
        error: rawError.message
      });
    }
    
    console.log('✅ Raw sales data:', rawSales);
    
    // Test 2: All sales without date filter
    const { data: allSales, error: allError } = await supabase
      .from('sales')
      .select('*')
      .limit(10);
    
    console.log('✅ All sales (no filter):', allSales);
    
    // Test 3: Agent and Staff data
    const [agentsData, staffData] = await Promise.all([
      supabase.from('agents').select('id, name'),
      supabase.from('staff').select('id, name, position')
    ]);
    
    console.log('✅ Agents data:', agentsData.data);
    console.log('✅ Staff data:', staffData.data);
    
    // Test 4: Group sales by agent
    const salesByAgent: { [key: string]: any[] } = {};
    (rawSales || []).forEach(sale => {
      const agentId = sale.agent_id;
      if (!salesByAgent[agentId]) {
        salesByAgent[agentId] = [];
      }
      salesByAgent[agentId].push(sale);
    });
    
    console.log('✅ Sales grouped by agent:', salesByAgent);
    
    return NextResponse.json({
      success: true,
      debug: {
        filters: { startDate, endDate, staffId },
        rawSalesCount: rawSales?.length || 0,
        allSalesCount: allSales?.length || 0,
        rawSales: rawSales,
        allSales: allSales,
        agents: agentsData.data,
        staff: staffData.data,
        salesByAgent: salesByAgent,
        agentKeys: Object.keys(salesByAgent),
        staffFilter: staffId ? `Filtering by staff: ${staffId}` : 'No staff filter'
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 