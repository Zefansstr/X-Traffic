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
  reactiveCount: number
  ndCount: number
  headPerCount: number
}

// New Commission Scheme dengan logika yang lebih kompleks
export interface AdvancedCommissionRule {
  id: string
  position: string // SE1, SE2, PE1, PE2, Manager
  department: string // TMT, CRT
  type: 'FDA_RATE' | 'HEAD_PER_COUNT' // FDA_RATE untuk TMT, HEAD_PER_COUNT untuk CRT
  min_count: number
  max_count: number | null
  rate_value: number // FDA_Rate value atau Head_Per_Count value
  currency: 'MYR' | 'USD'
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
      // Fallback exchange rate USD to MYR = 4.7
      if (fromCurrency === 'USD' && toCurrency === 'MYR') {
        return amount * 4.7
      }
      return amount
    }

    return amount * exchangeRate.rate
  } catch (error) {
    console.error('Error converting currency:', error)
    // Fallback exchange rate USD to MYR = 4.7
    if (fromCurrency === 'USD' && toCurrency === 'MYR') {
      return amount * 4.7
    }
    return amount
  }
}

// New calculation function untuk TMT dengan FDA_Rate logic
export async function calculateTMTCommissionNew(
  ndCount: number,
  position: string,
  totalAmount: number
): Promise<{ commission: number, tier: string, fdaRate: number }> {
  try {
    let fdaRate = 0

    // Logic untuk SE2 TMT
    if (position === 'SE2') {
      if (ndCount <= 150) {
        fdaRate = 7
      } else if (ndCount >= 151 && ndCount <= 200) {
        fdaRate = 8
      } else if (ndCount >= 201 && ndCount <= 235) {
        fdaRate = 9
      } else if (ndCount >= 236) {
        fdaRate = 10
      }
    }
    // Logic untuk SE1 & PE1 TMT
    else if (position === 'SE1' || position === 'PE1') {
      if (ndCount <= 140) {
        fdaRate = 7
      } else if (ndCount >= 141 && ndCount <= 190) {
        fdaRate = 8
      } else if (ndCount >= 191 && ndCount <= 225) {
        fdaRate = 9
      } else if (ndCount >= 226) {
        fdaRate = 10
      }
    }
    // For other positions, use default calculation
    else {
      fdaRate = 7 // Default
    }

    const commission = (totalAmount * fdaRate) / 100
    const tier = `FDA Rate ${fdaRate}%`

    return {
      commission,
      tier,
      fdaRate
    }
  } catch (error) {
    console.error('Error calculating TMT commission:', error)
    return { commission: 0, tier: 'Error', fdaRate: 0 }
  }
}

// New calculation function untuk CRT dengan Head_Per_Count logic
export async function calculateCRTCommissionNew(
  reactiveCount: number,
  position: string
): Promise<{ commission: number, tier: string, headPerCount: number }> {
  try {
    let headPerCountUSD = 0

    // Logic untuk SE2 CRT
    if (position === 'SE2') {
      if (reactiveCount < 130) {
        headPerCountUSD = 0.5
      } else if (reactiveCount >= 131 && reactiveCount <= 160) {
        headPerCountUSD = 0.8
      } else if (reactiveCount >= 161 && reactiveCount <= 200) {
        headPerCountUSD = 0.9
      } else if (reactiveCount >= 201) {
        headPerCountUSD = 1.0
      }
    }
    // Logic untuk SE1 & PE1 CRT
    else if (position === 'SE1' || position === 'PE1') {
      if (reactiveCount < 110) {
        headPerCountUSD = 0.5
      } else if (reactiveCount >= 111 && reactiveCount <= 140) {
        headPerCountUSD = 0.8
      } else if (reactiveCount >= 141 && reactiveCount <= 170) {
        headPerCountUSD = 0.9
      } else if (reactiveCount >= 171) {
        headPerCountUSD = 1.0
      }
    }
    // For other positions, use default
    else {
      headPerCountUSD = 0.5 // Default
    }

    // Calculate total commission in USD
    const totalCommissionUSD = reactiveCount * headPerCountUSD
    
    // Convert to MYR
    const commissionMYR = await convertCurrency(totalCommissionUSD, 'USD', 'MYR')
    
    const tier = `Head Count $${headPerCountUSD}`

    return {
      commission: commissionMYR,
      tier,
      headPerCount: headPerCountUSD
    }
  } catch (error) {
    console.error('Error calculating CRT commission:', error)
    return { commission: 0, tier: 'Error', headPerCount: 0 }
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
  reactiveCount: number
  ndCount: number
}> {
  try {
    const depositorCount = sales.filter(sale => sale.is_depositor).length
    const fdaCount = sales.filter(sale => sale.is_fda).length
    const fdaRate = depositorCount > 0 ? (fdaCount / depositorCount) * 100 : 0
    
    // Calculate reactive count (for CRT commission)
    const reactiveCount = sales.filter(sale => sale.type === 'CRT').length
    
    // Calculate ND count (for TMT commission)
    const ndCount = sales.filter(sale => sale.type === 'TMT' && sale.is_depositor).length
    
    // Mock KPI calculation
    const kpiScore = depositorCount * 10 + fdaCount * 5

    // Mock qualification criteria
    const kpiTarget = position === 'SE1' ? 100 : position === 'SE2' ? 150 : 200
    const depositorTarget = position === 'SE1' ? 10 : position === 'SE2' ? 15 : 20

    const isQualified = kpiScore >= kpiTarget && depositorCount >= depositorTarget

    return {
      kpiScore,
      depositorCount,
      fdaCount,
      fdaRate,
      isQualified,
      reactiveCount,
      ndCount
    }
  } catch (error) {
    console.error('Error calculating KPI score:', error)
    return {
      kpiScore: 0,
      depositorCount: 0,
      fdaCount: 0,
      fdaRate: 0,
      isQualified: false,
      reactiveCount: 0,
      ndCount: 0
    }
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

      // Calculate KPI data first (includes reactive and nd counts)
      const kpiData = await calculateKPIScore(staffSalesData, position)

      // Calculate TMT data
      const tmtSales = staffSalesData.filter(sale => sale.type === 'TMT')
      const tmtTotal = tmtSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)

      // Calculate CRT data  
      const crtSales = staffSalesData.filter(sale => sale.type === 'CRT')
      const crtTotal = crtSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)

      // Calculate commissions using new logic
      const tmtResult = await calculateTMTCommissionNew(kpiData.ndCount, position, tmtTotal)
      const crtResult = await calculateCRTCommissionNew(kpiData.reactiveCount, position)
      
      const totalCommission = tmtResult.commission + crtResult.commission

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
        currentTier: `TMT: ${tmtResult.tier}, CRT: ${crtResult.tier}`,
        nextTier: null,
        distanceToNextTier: 0,
        headPerCount: crtResult.headPerCount
      })
    }

    return commissionData.sort((a, b) => b.totalCommission - a.totalCommission)
  } catch (error) {
    console.error('Error generating commission report:', error)
    return []
  }
}

// Function untuk save commission rules ke database
export async function saveCommissionRule(rule: Omit<AdvancedCommissionRule, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('advanced_commission_rules')
      .insert(rule)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error saving commission rule:', error)
    return { success: false, error }
  }
}

// Function untuk get commission rules dari database
export async function getCommissionRules() {
  try {
    const { data, error } = await supabase
      .from('advanced_commission_rules')
      .select('*')
      .eq('is_active', true)
      .order('position')
      .order('department')

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error getting commission rules:', error)
    return { success: false, data: [] }
  }
} 