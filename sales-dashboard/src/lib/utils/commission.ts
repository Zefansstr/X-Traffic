import { supabase } from '../supabase'

export interface CommissionData {
  staffId: string
  staffName: string
  position: string
  department: string
  tmtTotal: number
  crtTotal: number
  tmtCommission: number
  crtCommission: number
  totalCommission: number
  kpiScore: number
  depositorCount: number
  fdaCount: number
  fdaRate: number
  isQualified: boolean
  distanceToNextTier: number
  currentTier: string
  nextTier: string | null
}

// Commission Scheme Types
export interface CommissionScheme {
  id: string
  name: string // 'TMT' or 'CRT'
  type: 'percentage' | 'head_count' // percentage for TMT, head_count for CRT
  department: string
  position: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Commission Tiers (Caps)
export interface CommissionTier {
  id: string
  scheme_id: string
  tier_name: string // 'Cap 1', 'Cap 2', etc
  min_count: number // minimum customer/member count
  max_count: number // maximum customer/member count  
  rate: number // percentage for TMT, USD amount for CRT
  currency: string // 'MYR' for TMT, 'USD' for CRT
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'MYR'
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  try {
    const { data: exchangeRate, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .eq('is_active', true)
      .single()

    if (error || !exchangeRate) {
      console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
      return amount // Return original amount if no rate found
    }

    return amount * exchangeRate.rate
  } catch (error) {
    console.error('Error converting currency:', error)
    return amount
  }
}

export async function calculateTMTCommission(
  totalAmount: number,
  customerCount: number,
  department: string,
  position: string
): Promise<{ commission: number, tier: string, rate: number }> {
  try {
    // Get TMT commission scheme
    const { data: scheme, error: schemeError } = await supabase
      .from('commission_schemes')
      .select('id')
      .eq('name', 'TMT')
      .eq('type', 'percentage')
      .eq('department', department)
      .eq('position', position)
      .eq('is_active', true)
      .single()

    if (schemeError || !scheme) {
      console.warn(`No TMT commission scheme found for ${department} ${position}`)
      return { commission: 0, tier: 'No Tier', rate: 0 }
    }

    // Find appropriate tier based on customer count
    const { data: tier, error: tierError } = await supabase
      .from('commission_tiers')
      .select('*')
      .eq('scheme_id', scheme.id)
      .lte('min_count', customerCount)
      .gte('max_count', customerCount)
      .eq('is_active', true)
      .single()

    if (tierError || !tier) {
      console.warn(`No TMT tier found for ${customerCount} customers`)
      return { commission: 0, tier: 'No Tier', rate: 0 }
    }

    const commission = (totalAmount * tier.rate) / 100
    return {
      commission,
      tier: tier.tier_name,
      rate: tier.rate
    }
  } catch (error) {
    console.error('Error calculating TMT commission:', error)
    return { commission: 0, tier: 'Error', rate: 0 }
  }
}

export async function calculateCRTCommission(
  memberCount: number,
  department: string,
  position: string
): Promise<{ commission: number, tier: string, rate: number }> {
  try {
    // Get CRT commission scheme
    const { data: scheme, error: schemeError } = await supabase
      .from('commission_schemes')
      .select('id')
      .eq('name', 'CRT')
      .eq('type', 'head_count')
      .eq('department', department)
      .eq('position', position)
      .eq('is_active', true)
      .single()

    if (schemeError || !scheme) {
      console.warn(`No CRT commission scheme found for ${department} ${position}`)
      return { commission: 0, tier: 'No Tier', rate: 0 }
    }

    // Find appropriate tier based on member count
    const { data: tier, error: tierError } = await supabase
      .from('commission_tiers')
      .select('*')
      .eq('scheme_id', scheme.id)
      .lte('min_count', memberCount)
      .gte('max_count', memberCount)
      .eq('is_active', true)
      .single()

    if (tierError || !tier) {
      console.warn(`No CRT tier found for ${memberCount} members`)
      return { commission: 0, tier: 'No Tier', rate: 0 }
    }

    // Convert USD to MYR
    const commissionUSD = memberCount * tier.rate
    const commissionMYR = await convertCurrency(commissionUSD, 'USD', 'MYR')
    
    return {
      commission: commissionMYR,
      tier: tier.tier_name,
      rate: tier.rate
    }
  } catch (error) {
    console.error('Error calculating CRT commission:', error)
    return { commission: 0, tier: 'Error', rate: 0 }
  }
}

export async function calculateKPIScore(
  sales: any[],
  position: string
): Promise<{
  kpiScore: number
  depositorCount: number
  fdaCount: number
  fdaRate: number
  isQualified: boolean
}> {
  try {
    // Get KPI targets from commission rates (we can create this table later)
    const depositorCount = sales.filter(sale => sale.is_depositor).length
    const fdaCount = sales.filter(sale => sale.is_fda).length
    const fdaRate = depositorCount > 0 ? (fdaCount / depositorCount) * 100 : 0
    
    // Mock KPI calculation for now
    const kpiScore = depositorCount * 10 + fdaCount * 5

    // Mock qualification criteria (can be configurable later)
    const kpiTarget = position === 'SE1' ? 100 : position === 'SE2' ? 150 : 200
    const depositorTarget = position === 'SE1' ? 10 : position === 'SE2' ? 15 : 20

    const isQualified = kpiScore >= kpiTarget && depositorCount >= depositorTarget

    return {
      kpiScore,
      depositorCount,
      fdaCount,
      fdaRate,
      isQualified
    }
  } catch (error) {
    console.error('Error calculating KPI score:', error)
    return {
      kpiScore: 0,
      depositorCount: 0,
      fdaCount: 0,
      fdaRate: 0,
      isQualified: false
    }
  }
}

export async function findNextTier(
  currentCount: number,
  schemeId: string
): Promise<{ nextTier: string | null, distanceToNext: number }> {
  try {
    const { data: tiers, error } = await supabase
      .from('commission_tiers')
      .select('*')
      .eq('scheme_id', schemeId)
      .gt('min_count', currentCount)
      .eq('is_active', true)
      .order('min_count', { ascending: true })
      .limit(1)

    if (error || !tiers || tiers.length === 0) {
      return { nextTier: null, distanceToNext: 0 }
    }

    const nextTier = tiers[0]
    return {
      nextTier: nextTier.tier_name,
      distanceToNext: nextTier.min_count - currentCount
    }
  } catch (error) {
    console.error('Error finding next tier:', error)
    return { nextTier: null, distanceToNext: 0 }
  }
}

export async function generateCommissionReport(
  startDate: string,
  endDate: string
): Promise<CommissionData[]> {
  try {
    // Get sales data with staff and department info
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        staff:staff_id (
          id, name, position, department_id,
          departments:department_id (name)
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('status', 'closed')

    if (salesError) {
      console.warn('Sales query failed, returning empty report:', salesError.message)
      return []
    }

    if (!sales || sales.length === 0) {
      return []
    }

    // Group sales by staff
    const staffSales: { [key: string]: any[] } = {}
    sales.forEach((sale: any) => {
      const staffId = sale.staff?.id
      if (staffId) {
        if (!staffSales[staffId]) {
          staffSales[staffId] = []
        }
        staffSales[staffId].push(sale)
      }
    })

    const commissionData: CommissionData[] = []

    for (const [staffId, staffSalesData] of Object.entries(staffSales)) {
      const staff = staffSalesData[0].staff
      if (!staff) continue

      const position = staff.position
      const department = staff.departments?.name || 'Unknown'

      // Calculate TMT data
      const tmtSales = staffSalesData.filter(sale => sale.type === 'TMT')
      const tmtTotal = tmtSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      const tmtCustomerCount = tmtSales.filter(sale => sale.is_depositor).length

      // Calculate CRT data  
      const crtSales = staffSalesData.filter(sale => sale.type === 'CRT')
      const crtTotal = crtSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      const crtMemberCount = crtSales.length

      // Calculate commissions
      const tmtResult = await calculateTMTCommission(tmtTotal, tmtCustomerCount, department, position)
      const crtResult = await calculateCRTCommission(crtMemberCount, department, position)
      
      const totalCommission = tmtResult.commission + crtResult.commission

      // Calculate KPI
      const kpiData = await calculateKPIScore(staffSalesData, position)

      commissionData.push({
        staffId,
        staffName: staff.name,
        position,
        department,
        tmtTotal,
        crtTotal,
        tmtCommission: tmtResult.commission,
        crtCommission: crtResult.commission,
        totalCommission,
        ...kpiData,
        currentTier: tmtResult.tier,
        nextTier: null, // Will be calculated if needed
        distanceToNextTier: 0 // Will be calculated if needed
      })
    }

    return commissionData.sort((a, b) => b.totalCommission - a.totalCommission)
  } catch (error) {
    console.error('Error generating commission report:', error)
    return []
  }
} 