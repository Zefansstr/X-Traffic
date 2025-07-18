import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all sales with their dates
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('id, customer_name, created_at, amount, department, staff_id')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get sales data',
        details: error.message
      }, { status: 500 })
    }

    // Group by date
    const dateGroups: { [key: string]: any[] } = {}
    salesData?.forEach(sale => {
      const date = sale.created_at.split('T')[0] // Get YYYY-MM-DD part
      if (!dateGroups[date]) {
        dateGroups[date] = []
      }
      dateGroups[date].push(sale)
    })

    // Get date range info
    const dates = Object.keys(dateGroups).sort()
    const earliestDate = dates[dates.length - 1] // Because sorted desc
    const latestDate = dates[0]

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: salesData?.length || 0,
        dateRange: {
          earliest: earliestDate,
          latest: latestDate
        },
        dateGroups,
        suggestions: {
          startDate: earliestDate,
          endDate: latestDate
        },
        sampleSales: salesData?.slice(0, 5) || []
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to list sales dates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 