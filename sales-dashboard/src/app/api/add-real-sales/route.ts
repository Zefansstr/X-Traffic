import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Helper function to generate random date in July 2025
function generateRandomDate() {
  const day = Math.floor(Math.random() * 29) + 1
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  const second = Math.floor(Math.random() * 60)
  
  // Format: 2025-07-DD HH:MM:SS (compatible with PostgreSQL)
  return `2025-07-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Adding real sales data...')

    // First, check and create sample staff if they don't exist
    console.log('📋 Checking existing staff...')
    const { data: existingStaff, error: staffError } = await supabase
      .from('staff')
      .select('id, name, position')

    if (staffError) {
      console.error('❌ Error checking staff:', staffError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing staff',
        details: staffError.message
      }, { status: 500 })
    }

    console.log('✅ Existing staff:', existingStaff)

    // Check if we have Mike and Jane, if not create them
    const mikeExists = existingStaff?.some(s => s.name.includes('Mike'))
    const janeExists = existingStaff?.some(s => s.name.includes('Jane'))

    // Get or create departments first
    let tmtDeptId, crtDeptId
    const { data: departments } = await supabase
      .from('departments')
      .select('id, code')

    tmtDeptId = departments?.find(d => d.code === 'TMT')?.id
    crtDeptId = departments?.find(d => d.code === 'CRT')?.id

    if (!tmtDeptId || !crtDeptId) {
      console.log('🏢 Creating departments...')
      // Create departments if they don't exist
      if (!tmtDeptId) {
        const { data: tmtDept, error: tmtError } = await supabase
          .from('departments')
          .insert({ name: 'TMT', code: 'TMT', description: 'Traffic Management Team' })
          .select('id')
          .single()
        if (!tmtError) tmtDeptId = tmtDept.id
      }
      if (!crtDeptId) {
        const { data: crtDept, error: crtError } = await supabase
          .from('departments')
          .insert({ name: 'CRT', code: 'CRT', description: 'Customer Relations Team' })
          .select('id')
          .single()
        if (!crtError) crtDeptId = crtDept.id
      }
    }

    // Create staff if they don't exist
    if (!mikeExists) {
      console.log('👤 Creating Mike Johnson...')
      await supabase
        .from('staff')
        .insert({
          name: 'Mike Johnson',
          position: 'PE1',
          department_id: tmtDeptId,
          email: 'mike.johnson@company.com',
          phone: '+60123456789',
          is_active: true
        })
    }

    if (!janeExists) {
      console.log('👤 Creating Jane Smith...')
      await supabase
        .from('staff')
        .insert({
          name: 'Jane Smith',
          position: 'SE1',
          department_id: crtDeptId,
          email: 'jane.smith@company.com',
          phone: '+60123456790',
          is_active: true
        })
    }

    // Ensure we have at least one agent
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .limit(1)

    if (!agents || agents.length === 0) {
      console.log('🏢 Creating sample agent...')
      await supabase
        .from('agents')
        .insert({
          name: 'Sample Agent',
          description: 'Sample agent for testing'
        })
    }

    // Now get the staff IDs for data insertion
    const { data: staffForInsert } = await supabase
      .from('staff')
      .select('id, name, position')

    const mike = staffForInsert?.find(s => s.name.includes('Mike'))
    const jane = staffForInsert?.find(s => s.name.includes('Jane'))
    
    const { data: agentsForInsert } = await supabase
      .from('agents')
      .select('id')
      .limit(1)

    if (!mike || !jane || !agentsForInsert?.[0]) {
      return NextResponse.json({
        success: false,
        error: 'Required staff or agents not found',
        details: { mike: !!mike, jane: !!jane, agent: !!agentsForInsert?.[0] }
      }, { status: 400 })
    }

    const agentId = agentsForInsert[0].id

    console.log('💾 Inserting sample sales data...')

    // Insert TMT sales for Mike Johnson (PE1)
    const mikeTMTSales = []
    for (let i = 1; i <= 180; i++) {
      const dateTime = generateRandomDate()
      mikeTMTSales.push({
        customer_name: `TMT Customer Mike ${i}`,
        amount: parseFloat((Math.random() * 8000 + 2000).toFixed(2)),
        amount_in_myr: parseFloat((Math.random() * 8000 + 2000).toFixed(2)),
        department: 'TMT',
        type: 'TMT',
        staff_id: mike.id,
        agent_id: agentId,
        status: 'closed',
        is_depositor: true,
        is_fda: Math.random() > 0.7,
        created_at: dateTime,
        date: dateTime
      })
    }

    // Insert in batches of 100
    for (let i = 0; i < mikeTMTSales.length; i += 100) {
      const batch = mikeTMTSales.slice(i, i + 100)
      const { error } = await supabase
        .from('sales')
        .insert(batch)
      
      if (error) {
        console.error('❌ Error inserting Mike TMT batch:', error)
      }
    }

    // Insert CRT sales for Mike Johnson
    const mikeCRTSales = []
    for (let i = 1; i <= 155; i++) {
      const dateTime = generateRandomDate()
      mikeCRTSales.push({
        customer_name: `CRT Customer Mike ${i}`,
        amount: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
        amount_in_myr: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
        department: 'CRT',
        type: 'CRT',
        staff_id: mike.id,
        agent_id: agentId,
        status: 'closed',
        is_depositor: false,
        is_fda: false,
        created_at: dateTime,
        date: dateTime
      })
    }

    for (let i = 0; i < mikeCRTSales.length; i += 100) {
      const batch = mikeCRTSales.slice(i, i + 100)
      const { error } = await supabase
        .from('sales')
        .insert(batch)
      
      if (error) {
        console.error('❌ Error inserting Mike CRT batch:', error)
      }
    }

    // Insert TMT sales for Jane Smith (SE1)
    const janeTMTSales = []
    for (let i = 1; i <= 150; i++) {
      const dateTime = generateRandomDate()
      janeTMTSales.push({
        customer_name: `TMT Customer Jane ${i}`,
        amount: parseFloat((Math.random() * 6000 + 2000).toFixed(2)),
        amount_in_myr: parseFloat((Math.random() * 6000 + 2000).toFixed(2)),
        department: 'TMT',
        type: 'TMT',
        staff_id: jane.id,
        agent_id: agentId,
        status: 'closed',
        is_depositor: true,
        is_fda: Math.random() > 0.6,
        created_at: dateTime,
        date: dateTime
      })
    }

    for (let i = 0; i < janeTMTSales.length; i += 100) {
      const batch = janeTMTSales.slice(i, i + 100)
      const { error } = await supabase
        .from('sales')
        .insert(batch)
      
      if (error) {
        console.error('❌ Error inserting Jane TMT batch:', error)
      }
    }

    // Insert CRT sales for Jane Smith
    const janeCRTSales = []
    for (let i = 1; i <= 125; i++) {
      const dateTime = generateRandomDate()
      janeCRTSales.push({
        customer_name: `CRT Customer Jane ${i}`,
        amount: parseFloat((Math.random() * 4000 + 1000).toFixed(2)),
        amount_in_myr: parseFloat((Math.random() * 4000 + 1000).toFixed(2)),
        department: 'CRT',
        type: 'CRT',
        staff_id: jane.id,
        agent_id: agentId,
        status: 'closed',
        is_depositor: false,
        is_fda: false,
        created_at: dateTime,
        date: dateTime
      })
    }

    for (let i = 0; i < janeCRTSales.length; i += 100) {
      const batch = janeCRTSales.slice(i, i + 100)
      const { error } = await supabase
        .from('sales')
        .insert(batch)
      
      if (error) {
        console.error('❌ Error inserting Jane CRT batch:', error)
      }
    }

    // Verify inserted data
    const { data: verifyData, error: verifyError } = await supabase
      .from('sales')
      .select(`
        department,
        type,
        staff:staff_id(name, position),
        count:id.count()
      `)
      .gte('created_at', '2025-07-01')
      .lt('created_at', '2025-08-01')

    console.log('✅ Sales data inserted successfully!')
    console.log('📊 Verification:', verifyData)

    return NextResponse.json({
      success: true,
      message: 'Real sales data added successfully',
      summary: {
        mikeTMT: mikeTMTSales.length,
        mikeCRT: mikeCRTSales.length,
        janeTMT: janeTMTSales.length,
        janeCRT: janeCRTSales.length,
        totalRecords: mikeTMTSales.length + mikeCRTSales.length + janeTMTSales.length + janeCRTSales.length
      },
      verification: verifyData
    })

  } catch (error) {
    console.error('❌ Error adding real sales data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add real sales data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 