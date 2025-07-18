import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Commission Simple API - Period: ${startDate} to ${endDate}`)

    // Exchange rates
    const USD_TO_MYR_RATE = 4.7
    const HEAD_PER_COUNT_USD = 0.5 // $0.50 per customer

    // 1. Ambil data sales sederhana
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (salesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get sales data',
        details: salesError.message
      }, { status: 500 })
    }

    console.log(`📊 Found ${sales?.length || 0} total sales records`)

    // 2. Ambil data staff
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')

    if (staffError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get staff data',
        details: staffError.message
      }, { status: 500 })
    }

    console.log(`👥 Found ${staff?.length || 0} staff members`)

    // 3. Advanced Commission Logic - Tier-based calculation (NO DATABASE)
    console.log('💰 Using ADVANCED TIER-BASED commission logic')

    // Helper function to get TMT rate based on position and ND count
    const getTMTRate = (position: string, ndCount: number): number => {
      if (position === 'SE2') {
        if (ndCount <= 150) return 7
        if (ndCount <= 200) return 8
        if (ndCount <= 235) return 9
        return 10 // >= 236
      } else if (position === 'SE1' || position === 'PE1') {
        if (ndCount <= 140) return 7
        if (ndCount <= 190) return 8
        if (ndCount <= 225) return 9
        return 10 // >= 226
      } else {
        // Default rates for other positions
        return position === 'PE2' ? 10 : position === 'Manager' ? 12 : 7
      }
    }

    // Helper function to get CRT rate (per head) based on position and reactive count
    const getCRTRate = (position: string, reactiveCount: number): number => {
      if (position === 'SE2') {
        if (reactiveCount < 130) return 0.5
        if (reactiveCount <= 160) return 0.8
        if (reactiveCount <= 200) return 0.9
        return 1.0 // >= 201
      } else if (position === 'SE1' || position === 'PE1') {
        if (reactiveCount < 110) return 0.5
        if (reactiveCount <= 140) return 0.8
        if (reactiveCount <= 170) return 0.9
        return 1.0 // >= 171
      } else {
        // Default rate for other positions
        return 0.5
      }
    }

    // 4. Group sales by staff_id dan hitung total
    const staffSales: { [key: string]: any } = {}
    
    sales?.forEach((sale: any) => {
      const staffId = sale.staff_id
      if (staffId) {
        if (!staffSales[staffId]) {
          staffSales[staffId] = {
            sales: [],
            totalAmount: 0,
            totalDepositors: 0,
            uniqueCustomers: new Set(),
            tmtUniqueCustomers: new Set(), // Unique customers untuk TMT saja
            crtUniqueCustomers: new Set(), // Unique customers untuk CRT saja
            tmtAmount: 0,
            crtAmount: 0,
            tmtDepositors: 0,
            crtDepositors: 0
          }
        }
        
        staffSales[staffId].sales.push(sale)
        staffSales[staffId].totalAmount += sale.amount || 0
        
        // Setiap sales record dianggap sebagai 1 depositor
        staffSales[staffId].totalDepositors += 1
        
        // Track unique customers
        if (sale.customer_name) {
          const normalizedName = sale.customer_name.toLowerCase().trim()
          staffSales[staffId].uniqueCustomers.add(normalizedName)
        }
        
        // Group by department dan track unique customers per department
        if (sale.department === 'TMT') {
          staffSales[staffId].tmtAmount += sale.amount || 0
          staffSales[staffId].tmtDepositors += 1
          
          // Track unique customers untuk TMT
          if (sale.customer_name) {
            const normalizedName = sale.customer_name.toLowerCase().trim()
            staffSales[staffId].tmtUniqueCustomers.add(normalizedName)
          }
        } else if (sale.department === 'CRT') {
          staffSales[staffId].crtAmount += sale.amount || 0
          staffSales[staffId].crtDepositors += 1
          
          // Track unique customers untuk CRT
          if (sale.customer_name) {
            const normalizedName = sale.customer_name.toLowerCase().trim()
            staffSales[staffId].crtUniqueCustomers.add(normalizedName)
          }
        }
      }
    })

    // 5. Hitung commission SIMPLE berdasarkan position saja
    const commissionData: any[] = []
    
    Object.keys(staffSales).forEach(staffId => {
      const staffInfo = staff?.find(s => s.id === staffId)
      if (!staffInfo) return
      
      const salesData = staffSales[staffId]
      
      // Use unique customers count as the actual depositor count
      const actualDepositors = salesData.uniqueCustomers.size
      const tmtUniqueDepositors = salesData.tmtUniqueCustomers.size
      const crtUniqueDepositors = salesData.crtUniqueCustomers.size
      
      // Menggunakan ADVANCED TIER-BASED commission calculation
      const tmtRate = getTMTRate(staffInfo.position, tmtUniqueDepositors)
      const crtRatePerHead = getCRTRate(staffInfo.position, crtUniqueDepositors)
      
      // TMT Commission: TMT amount × TMT rate (tier-based)
      const tmtRateDecimal = tmtRate / 100
      const tmtCommission = salesData.tmtAmount * tmtRateDecimal
      
      // CRT Commission: Reactive Count × CRT rate per head × USD to MYR rate
      const crtCommissionUSD = crtUniqueDepositors * crtRatePerHead
      const crtCommission = crtCommissionUSD * USD_TO_MYR_RATE
      
      const totalCommission = tmtCommission + crtCommission
      
      console.log(`${staffInfo.name} (${staffInfo.position}): TMT=${salesData.tmtAmount} × ${tmtRateDecimal} = ${tmtCommission}, CRT=${crtUniqueDepositors} × $${crtRatePerHead} = ${crtCommission}`)
      
      commissionData.push({
        staffId: staffId,
        staffName: staffInfo.name,
        position: staffInfo.position,
        department: staffInfo.department_id || 'Unknown',
        totalDepositors: actualDepositors,
        totalSalesRecords: salesData.totalDepositors, // Total transactions
        totalAmount: salesData.totalAmount,
        tmtAmount: salesData.tmtAmount,
        crtAmount: salesData.crtAmount,
        tmtDepositors: salesData.tmtDepositors,
        crtDepositors: salesData.crtDepositors,
        tmtUniqueDepositors: tmtUniqueDepositors,
        crtUniqueDepositors: crtUniqueDepositors,
        tmtRate: tmtRate, // Rate dari tier logic
        crtRate: crtRatePerHead, // Rate dari tier logic
        commissionRate: tmtRate, // For UI compatibility
        totalCommission: totalCommission,
        tmtCommission: tmtCommission,
        crtCommission: crtCommission,
        crtCommissionUSD: crtCommissionUSD, // For debugging
        salesCount: salesData.sales.length,
        // For compatibility with existing UI
        ndCount: tmtUniqueDepositors, // TMT tab: unique customers yang melakukan TMT saja
        reactiveCount: crtUniqueDepositors, // CRT tab: unique customers yang melakukan CRT saja
        fdaRate: tmtRate,
        headPerCount: crtRatePerHead, // Dynamic rate per customer
        isQualified: actualDepositors > 5,
        kpiScore: actualDepositors * 10,
        fdaCount: salesData.sales.filter((s: any) => s.is_fda).length,
        depositorCount: actualDepositors,
        distanceToNextTier: 0,
        currentTier: `TMT: ${tmtRate}%, CRT: $${crtRatePerHead}/head`
      })
    })

    console.log(`✅ Generated commission data for ${commissionData.length} staff members`)

    return NextResponse.json({
      success: true,
      data: commissionData.sort((a, b) => b.totalCommission - a.totalCommission),
      period: { startDate, endDate },
      summary: {
        totalStaff: commissionData.length,
        totalSales: sales?.length || 0,
        totalCommission: commissionData.reduce((sum, item) => sum + item.totalCommission, 0)
      },
      debug: {
        rawSalesCount: sales?.length || 0,
        processedStaffCount: Object.keys(staffSales).length,
        sampleSales: sales?.slice(0, 3),
        commissionLogic: 'ADVANCED_TIER_BASED',
        sampleCalculations: commissionData.slice(0, 2).map(item => ({
          staff: item.staffName,
          position: item.position,
          tmtCount: item.tmtUniqueDepositors,
          crtCount: item.crtUniqueDepositors,
          tmtRate: `${item.tmtRate}%`,
          crtRate: `$${item.crtRate}/head`,
          tier: item.currentTier
        }))
      }
    })

  } catch (error) {
    console.error('❌ Simple commission error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate commission report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 