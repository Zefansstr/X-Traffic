import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '2025-06-30'
    const endDate = searchParams.get('endDate') || '2025-07-30'
    
    console.log('🧪 Testing commission data flow...')
    console.log('Date range:', startDate, 'to', endDate)
    
    // Step 1: Raw sales data
    const { data: rawSales, error: rawError } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .limit(10)
    
    console.log('Step 1 - Raw sales:', rawSales?.length)
    
    // Step 2: Sales with staff JOIN
    const { data: salesWithStaff, error: joinError } = await supabase
      .from('sales')
      .select(`
        *,
        staff:staff_id (
          id, name, position
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .limit(10)
    
    console.log('Step 2 - Sales with staff:', salesWithStaff?.length)
    
    // Step 3: Filter by status
    const { data: closedSales, error: statusError } = await supabase
      .from('sales')
      .select(`
        *,
        staff:staff_id (
          id, name, position
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'closed')
      .limit(10)
    
    console.log('Step 3 - Closed sales with staff:', closedSales?.length)
    
    return NextResponse.json({
      success: true,
      debug: {
        dateRange: { startDate, endDate },
        step1_rawSales: {
          count: rawSales?.length || 0,
          sample: rawSales?.slice(0, 2) || [],
          error: rawError?.message
        },
        step2_salesWithStaff: {
          count: salesWithStaff?.length || 0,
          sample: salesWithStaff?.slice(0, 2) || [],
          error: joinError?.message
        },
        step3_closedSales: {
          count: closedSales?.length || 0,
          sample: closedSales?.slice(0, 2) || [],
          error: statusError?.message
        },
        conclusion: {
          issue: salesWithStaff?.length === 0 ? 'JOIN_FAILED' : 
                 closedSales?.length === 0 ? 'STATUS_FILTER_TOO_STRICT' : 
                 'UNKNOWN'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Test commission error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 