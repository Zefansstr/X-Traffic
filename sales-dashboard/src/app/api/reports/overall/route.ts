import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface SalesData {
  id: string;
  customer_name: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  staff_id: string;
  agent_id: string;
  date: string;
  is_depositor: boolean;
  is_fda: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  console.log('🔍 Overall Report API - Starting...')
  
  try {
    await connectDB()
    console.log('✅ Database connected')
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')
    
    console.log('📅 Query params:', { startDate, endDate, staffId })
    
    if (!startDate || !endDate) {
      console.log('❌ Missing required dates')
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Try to fetch sales data from Supabase using actual table structure
    let salesData: SalesData[] = []
    
    try {
      // Use actual table structure from debug data with staff filter
      let query = supabase
        .from('sales')
        .select(`
          id,
          customer_name,
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
        .gte('created_at', startDate + 'T00:00:00')
        .lt('created_at', endDate + 'T23:59:59');

      // Add staff filter if specified
      if (staffId && staffId !== 'all') {
        query = query.eq('staff_id', staffId);
      }

      const { data: sales, error } = await query.order('created_at', { ascending: false });
      
      console.log('📊 Database query result:', { 
        salesCount: sales?.length || 0, 
        hasError: !!error,
        errorMessage: error?.message 
      })
      
      if (error) {
        console.error('❌ Error fetching sales from database:', error.message)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch sales data from database',
          details: error.message
        }, { status: 500 });
      } else {
        // Transform data to match expected format using actual table structure
        salesData = (sales || []).map(sale => ({
          id: sale.id,
          customer_name: sale.customer_name,
          amount: sale.amount,
          currency: 'MYR',
          type: sale.department || 'TMT', // Use department as type
          status: 'closed', // Default status since all sales are considered closed
          staff_id: sale.staff_id,
          agent_id: sale.agent_id,
          date: sale.created_at,
          is_depositor: true, // Consider all sales as depositor for now since we don't have the field yet
          is_fda: true, // Consider all sales as FDA for now
          created_at: sale.created_at,
          updated_at: sale.updated_at
        }));
      }
    } catch (err) {
      console.error('❌ Database query failed:', err)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
    }

    // Calculate basic statistics
    const summaryTotalTMT = salesData
      .filter(sale => sale.type === 'TMT')
      .reduce((sum, sale) => sum + sale.amount, 0)
    
    const summaryTotalCRT = salesData
      .filter(sale => sale.type === 'CRT')
      .reduce((sum, sale) => sum + sale.amount, 0)
    
    const summaryTotalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0)
    const summaryTotalDepositors = salesData.filter(sale => sale.is_depositor).length
    const summaryTotalFDA = salesData.filter(sale => sale.is_fda).length

    // Get real agent and staff data from database
    const [agentsData, staffDataFromDB] = await Promise.all([
      supabase.from('agents').select('id, name'),
      supabase.from('staff').select('id, name, position')
    ]);

    const agentMap = new Map((agentsData.data || []).map(a => [a.id, a.name]));
    const staffMap = new Map((staffDataFromDB.data || []).map(s => [s.id, { name: s.name, position: s.position }]));

    // Group sales data by agent_id
    const salesByAgent: { [key: string]: SalesData[] } = {};
    salesData.forEach(sale => {
      const agentId = sale.agent_id;
      if (!salesByAgent[agentId]) {
        salesByAgent[agentId] = [];
      }
      salesByAgent[agentId].push(sale);
    });

    // Create agent performance data from real sales
    const agentPerformanceData = Object.keys(salesByAgent).map(agentId => {
      const agentSales = salesByAgent[agentId];
      const agentName = agentMap.get(agentId) || `Agent ${agentId.substring(0, 8)}`;
      
      // Find staff info from first sale (assuming agent belongs to one staff)
      const firstSale = agentSales[0];
      const staffInfo = staffMap.get(firstSale.staff_id) || { name: 'Unknown Staff', position: 'Unknown' };
      
      const tmtSales = agentSales.filter(s => s.type === 'TMT');
      const crtSales = agentSales.filter(s => s.type === 'CRT');
      
      const tmtTotal = tmtSales.reduce((sum, sale) => sum + sale.amount, 0);
      const crtTotal = crtSales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalSales = agentSales.reduce((sum, sale) => sum + sale.amount, 0);
      
      return {
        agentId: agentId,
        agentName: agentName,
        staffName: staffInfo.name,
        position: staffInfo.position,
        tmtTotal: tmtTotal,
        crtTotal: crtTotal,
        totalSales: totalSales,
        depositorCount: agentSales.filter(s => s.is_depositor).length,
        tmtDepositorCount: tmtSales.filter(s => s.is_depositor).length,
        crtDepositorCount: crtSales.filter(s => s.is_depositor).length,
        tmtSalesCount: tmtSales.length,
        crtSalesCount: crtSales.length,
        salesCount: agentSales.length
      };
    });

    const processedStaffData = [{
      staffId: staffId || 'all',
      staffName: staffId && staffId !== 'all' ? 'Selected Staff' : 'All Staff',
      position: 'All',
      agentData: agentPerformanceData,
      totalSales: summaryTotalSales,
      totalTMT: summaryTotalTMT,
      totalCRT: summaryTotalCRT,
      totalDepositors: summaryTotalDepositors
    }];

    // Count TMT and CRT depositors
    const tmtDepositors = salesData.filter(sale => sale.type === 'TMT' && sale.is_depositor).length;
    const crtDepositors = salesData.filter(sale => sale.type === 'CRT' && sale.is_depositor).length;

    const responseData = {
      summary: {
        totalTMT: summaryTotalTMT,
        totalCRT: summaryTotalCRT,
        totalSales: summaryTotalSales,
        totalDepositors: summaryTotalDepositors,
        totalFDA: summaryTotalFDA,
        totalTMTSalesCount: salesData.filter(s => s.type === 'TMT').length,
        totalCRTSalesCount: salesData.filter(s => s.type === 'CRT').length,
        totalTMTDepositors: tmtDepositors,
        totalCRTDepositors: crtDepositors
      },
      staffData: processedStaffData,
      isAgentBreakdown: true,
      salesData: salesData.map(sale => ({
        id: sale.id,
        customerName: sale.customer_name,
        staffName: staffMap.get(sale.staff_id)?.name || 'Unknown Staff',
        agentName: agentMap.get(sale.agent_id) || 'Unknown Agent',
        amount: sale.amount,
        type: sale.type,
        date: sale.date,
        isDepositor: sale.is_depositor,
        isFDA: sale.is_fda
      }))
    }

    console.log('✅ Overall Report API - Success')
    
    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('❌ Error in overall report:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 