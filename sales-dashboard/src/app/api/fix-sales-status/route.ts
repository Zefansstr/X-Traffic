import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Fixing sales status...')

    // Get all sales that don't have status 'closed'
    const { data: salesToFix, error: queryError } = await supabase
      .from('sales')
      .select('id, customer_name, status')
      .neq('status', 'closed')

    if (queryError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query sales',
        details: queryError.message
      }, { status: 500 })
    }

    console.log(`Found ${salesToFix?.length || 0} sales with non-closed status`)

    if (!salesToFix || salesToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All sales already have status "closed"',
        data: { fixedCount: 0 }
      })
    }

    // Update all sales to status 'closed'
    const { data: updatedSales, error: updateError } = await supabase
      .from('sales')
      .update({ status: 'closed' })
      .neq('status', 'closed')
      .select('id')

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update sales status',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedSales?.length || 0} sales to status "closed"`,
      data: {
        fixedCount: updatedSales?.length || 0,
        fixedSales: salesToFix.map(s => ({
          id: s.id,
          customer: s.customer_name,
          oldStatus: s.status,
          newStatus: 'closed'
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error fixing sales status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix sales status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 