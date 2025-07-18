import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '2025-06-30'
    const endDate = searchParams.get('endDate') || '2025-07-30'
    
    console.log('🔍 Debug Commission - Date range:', startDate, 'to', endDate)
    
    // Test 1: Check all sales in database
    const { data: allSales, error: allSalesError } = await supabase
      .from('sales')
      .select('*')
      .limit(5)
    
    console.log('All sales in DB:', allSales?.length)
    
    // Test 2: Check staff table
    const { data: allStaff, error: staffError } = await supabase
      .from('staff')
      .select('*')
    
    console.log('All staff in DB:', allStaff?.length)
    
    // Test 3: Check sales with date filter
    const { data: filteredSales, error: filteredError } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    
    console.log('Filtered sales:', filteredSales?.length)
    
    // Test 4: Check sales with staff join
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
    
    console.log('Sales with staff join:', salesWithStaff?.length)
    
    // Test 5: Check if we have department and type data
    const departmentCounts = filteredSales?.reduce((acc: any, sale: any) => {
      acc[sale.department || 'undefined'] = (acc[sale.department || 'undefined'] || 0) + 1
      return acc
    }, {})
    
    const typeCounts = filteredSales?.reduce((acc: any, sale: any) => {
      acc[sale.type || 'undefined'] = (acc[sale.type || 'undefined'] || 0) + 1
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      debug: {
        dateRange: { startDate, endDate },
        counts: {
          allSales: allSales?.length || 0,
          allStaff: allStaff?.length || 0,
          filteredSales: filteredSales?.length || 0,
          salesWithStaff: salesWithStaff?.length || 0
        },
        departmentCounts,
        typeCounts,
        sampleData: {
          firstSale: allSales?.[0],
          firstStaff: allStaff?.[0],
          firstFilteredSale: filteredSales?.[0],
          firstJoinedSale: salesWithStaff?.[0]
        },
        errors: {
          allSalesError: allSalesError?.message,
          staffError: staffError?.message,
          filteredError: filteredError?.message,
          joinError: joinError?.message
        }
      }
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 