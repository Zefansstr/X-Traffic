import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Starting to fix staff_ids in sales table...')

    // 1. Get all staff IDs that actually exist
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, name, position')

    if (staffError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get staff list',
        details: staffError.message
      }, { status: 500 })
    }

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No staff found in database'
      }, { status: 400 })
    }

    console.log('👥 Found staff:', staffList.map(s => `${s.name} (${s.id})`))

    // 2. Get all sales that have invalid or null staff_id
    const { data: salesWithBadStaffId, error: salesError } = await supabase
      .from('sales')
      .select('id, customer_name, staff_id, amount')

    if (salesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get sales data',
        details: salesError.message
      }, { status: 500 })
    }

    // 3. Find sales with invalid staff_id
    const validStaffIds = new Set(staffList.map(s => s.id))
    const invalidSales = salesWithBadStaffId?.filter(sale => 
      !sale.staff_id || !validStaffIds.has(sale.staff_id)
    ) || []

    console.log(`🔍 Found ${invalidSales.length} sales with invalid staff_id`)

    if (invalidSales.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All sales already have valid staff_id',
        data: { fixedCount: 0, totalSales: salesWithBadStaffId?.length || 0 }
      })
    }

    // 4. Assign random valid staff_id to invalid sales
    // This is a simple fix - in production you'd want better logic
    const updates = []
    for (let i = 0; i < invalidSales.length; i++) {
      const sale = invalidSales[i]
      const randomStaff = staffList[i % staffList.length] // Distribute evenly
      
      const { error: updateError } = await supabase
        .from('sales')
        .update({ staff_id: randomStaff.id })
        .eq('id', sale.id)

      if (updateError) {
        console.error(`❌ Failed to update sale ${sale.id}:`, updateError.message)
      } else {
        updates.push({
          saleId: sale.id,
          customer: sale.customer_name,
          newStaffId: randomStaff.id,
          staffName: randomStaff.name
        })
        console.log(`✅ Updated sale ${sale.id} -> staff ${randomStaff.name}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} sales records`,
      data: {
        fixedCount: updates.length,
        totalSales: salesWithBadStaffId?.length || 0,
        updates: updates.slice(0, 10), // Show first 10
        staffList: staffList.map(s => ({ id: s.id, name: s.name }))
      }
    })

  } catch (error) {
    console.error('❌ Error fixing staff IDs:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix staff IDs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 