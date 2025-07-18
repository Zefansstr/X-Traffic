import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug KAREN sales data...')

    // 1. Cari staff KAREN
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .ilike('name', '%karen%')

    if (staffError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to find KAREN staff',
        details: staffError.message
      }, { status: 500 })
    }

    if (!staff || staff.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'KAREN not found in staff table'
      }, { status: 404 })
    }

    const karenStaff = staff[0]
    console.log('👤 Found KAREN:', karenStaff)

    // 2. Cari semua sales KAREN
    const { data: allKarenSales, error: allSalesError } = await supabase
      .from('sales')
      .select('*')
      .eq('staff_id', karenStaff.id)

    if (allSalesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get KAREN sales',
        details: allSalesError.message
      }, { status: 500 })
    }

    // 3. Cari sales KAREN dalam periode commission report (June-July 2025)
    const { data: periodSales, error: periodError } = await supabase
      .from('sales')
      .select('*')
      .eq('staff_id', karenStaff.id)
      .gte('created_at', '2025-06-30')
      .lte('created_at', '2025-07-30')

    if (periodError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get KAREN period sales',
        details: periodError.message
      }, { status: 500 })
    }

    // 4. Analisis unique customers
    const uniqueCustomers = new Set()
    const customerAnalysis: any[] = []

    periodSales?.forEach((sale: any, index: number) => {
      const normalizedName = sale.customer_name?.toLowerCase().trim()
      uniqueCustomers.add(normalizedName)
      
      customerAnalysis.push({
        saleIndex: index + 1,
        customer_name: sale.customer_name,
        normalized_name: normalizedName,
        amount: sale.amount,
        department: sale.department,
        created_at: sale.created_at,
        uniqueCountSoFar: uniqueCustomers.size
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        karenStaff: {
          id: karenStaff.id,
          name: karenStaff.name,
          position: karenStaff.position
        },
        allSalesCount: allKarenSales?.length || 0,
        periodSalesCount: periodSales?.length || 0,
        uniqueCustomersCount: uniqueCustomers.size,
        uniqueCustomersList: Array.from(uniqueCustomers),
        salesAnalysis: customerAnalysis,
        periodSalesDetails: periodSales,
        tmtSalesCount: periodSales?.filter(s => s.department === 'TMT').length || 0,
        crtSalesCount: periodSales?.filter(s => s.department === 'CRT').length || 0,
        totalAmount: periodSales?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
      }
    })

  } catch (error) {
    console.error('❌ Debug KAREN error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to debug KAREN data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 