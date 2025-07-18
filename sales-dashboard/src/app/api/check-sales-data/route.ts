import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Checking existing sales data...')

    // 1. Check total sales count
    const { data: allSales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .limit(10)

    if (salesError) {
      console.error('❌ Sales query error:', salesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to query sales table',
        details: salesError.message
      }, { status: 500 })
    }

    // 2. Check sales count
    const { count: totalSalesCount, error: countError } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })

    // 3. Check staff table
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, name, position')

    // 4. Check if there are sales in the commission report date range
    const { data: julyData, error: julyError } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', '2025-06-30')
      .lte('created_at', '2025-07-30')

    // 5. Check all different date ranges
    const { data: allDates, error: datesError } = await supabase
      .from('sales')
      .select('created_at, date')
      .limit(20)

    return NextResponse.json({
      success: true,
      data: {
        totalSalesCount: totalSalesCount || 0,
        sampleSales: allSales || [],
        staffCount: staffData?.length || 0,
        staffList: staffData || [],
        julyDataCount: julyData?.length || 0,
        julySample: julyData?.slice(0, 3) || [],
        allDatesExample: allDates || []
      }
    })

  } catch (error) {
    console.error('❌ Check sales data error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check sales data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 