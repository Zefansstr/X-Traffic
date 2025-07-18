import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Check staff table
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')

    // 2. Check sales table with staff_id
    const { data: salesWithStaffId, error: salesError } = await supabase
      .from('sales')
      .select('id, customer_name, staff_id, amount, created_at')
      .limit(10)

    // 3. Try direct JOIN
    const { data: joinTest, error: joinError } = await supabase
      .from('sales')
      .select(`
        id,
        customer_name,
        staff_id,
        staff:staff_id (
          id, name, position
        )
      `)
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        staff: {
          count: staffData?.length || 0,
          data: staffData || [],
          error: staffError?.message
        },
        sales: {
          count: salesWithStaffId?.length || 0,
          sample: salesWithStaffId || [],
          error: salesError?.message
        },
        joinTest: {
          count: joinTest?.length || 0,
          sample: joinTest || [],
          error: joinError?.message
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 