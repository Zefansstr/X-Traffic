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
  created_at?: string
  updated_at?: string
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

// Function to get commission rules (can be fetched from API or passed as parameter)
export async function getCommissionRulesForCalculation(): Promise<AdvancedCommissionRule[]> {
  try {
    // Try to load from localStorage first (same as Setting page)
    if (typeof window !== 'undefined') {
      const savedRules = localStorage.getItem('advancedCommissionRules')
      if (savedRules) {
        return JSON.parse(savedRules)
      }
    }
  } catch (error) {
    console.warn('Error loading rules from localStorage:', error)
  }

  // Fallback to default sample rules if localStorage is empty or fails
  return [
         // SE2 CRT Rules
     {
       id: '1',
       position: 'SE2',
       department: 'CRT',
       type: 'HEAD_PER_COUNT',
       min_count: 0,
       max_count: 129,
       rate_value: 0.5,
       currency: 'USD',
       is_active: true
     },
    {
      id: '2',
      position: 'SE2',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 131,
      max_count: 160,
      rate_value: 0.8,
      currency: 'USD',
      is_active: true
    },
    {
      id: '3',
      position: 'SE2',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 161,
      max_count: 200,
      rate_value: 0.9,
      currency: 'USD',
      is_active: true
    },
    {
      id: '4',
      position: 'SE2',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 201,
      max_count: null,
      rate_value: 1.0,
      currency: 'USD',
      is_active: true
    },
    // SE2 TMT Rules
    {
      id: '5',
      position: 'SE2',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 0,
      max_count: 150,
      rate_value: 7,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '6',
      position: 'SE2',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 151,
      max_count: 200,
      rate_value: 8,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '7',
      position: 'SE2',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 201,
      max_count: 235,
      rate_value: 9,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '8',
      position: 'SE2',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 236,
      max_count: null,
      rate_value: 10,
      currency: 'MYR',
      is_active: true
    },
    // SE1/PE1 CRT Rules
    {
      id: '9',
      position: 'SE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 0,
      max_count: 109,
      rate_value: 0.5,
      currency: 'USD',
      is_active: true
    },
    {
      id: '10',
      position: 'SE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 111,
      max_count: 140,
      rate_value: 0.8,
      currency: 'USD',
      is_active: true
    },
    {
      id: '11',
      position: 'SE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 141,
      max_count: 170,
      rate_value: 0.9,
      currency: 'USD',
      is_active: true
    },
    {
      id: '12',
      position: 'SE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 171,
      max_count: null,
      rate_value: 1.0,
      currency: 'USD',
      is_active: true
    },
    // SE1 TMT Rules
    {
      id: '13',
      position: 'SE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 0,
      max_count: 140,
      rate_value: 7,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '14',
      position: 'SE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 141,
      max_count: 190,
      rate_value: 8,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '15',
      position: 'SE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 191,
      max_count: 225,
      rate_value: 9,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '16',
      position: 'SE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 226,
      max_count: null,
      rate_value: 10,
      currency: 'MYR',
      is_active: true
    },
    // PE1 rules (same as SE1)
    {
      id: '17',
      position: 'PE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 0,
      max_count: 109,
      rate_value: 0.5,
      currency: 'USD',
      is_active: true
    },
    {
      id: '18',
      position: 'PE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 111,
      max_count: 140,
      rate_value: 0.8,
      currency: 'USD',
      is_active: true
    },
    {
      id: '19',
      position: 'PE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 141,
      max_count: 170,
      rate_value: 0.9,
      currency: 'USD',
      is_active: true
    },
    {
      id: '20',
      position: 'PE1',
      department: 'CRT',
      type: 'HEAD_PER_COUNT',
      min_count: 171,
      max_count: null,
      rate_value: 1.0,
      currency: 'USD',
      is_active: true
    },
    {
      id: '21',
      position: 'PE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 0,
      max_count: 140,
      rate_value: 7,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '22',
      position: 'PE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 141,
      max_count: 190,
      rate_value: 8,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '23',
      position: 'PE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 191,
      max_count: 225,
      rate_value: 9,
      currency: 'MYR',
      is_active: true
    },
    {
      id: '24',
      position: 'PE1',
      department: 'TMT',
      type: 'FDA_RATE',
      min_count: 226,
      max_count: null,
      rate_value: 10,
      currency: 'MYR',
      is_active: true
    }
  ]
}

// Helper function to find the matching commission rule
function findMatchingRule(
  rules: AdvancedCommissionRule[], 
  position: string, 
  department: string, 
  type: 'FDA_RATE' | 'HEAD_PER_COUNT', 
  count: number
): AdvancedCommissionRule | null {
  console.log(`Looking for rule: Position=${position}, Department=${department}, Type=${type}, Count=${count}`)
  
  const applicableRules = rules.filter(rule => 
    rule.position.toUpperCase() === position.toUpperCase() && 
    rule.department.toUpperCase() === department.toUpperCase() && 
    rule.type === type &&
    rule.is_active &&
    count >= rule.min_count &&
    (rule.max_count === null || count <= rule.max_count)
  )
  
  console.log(`Found ${applicableRules.length} applicable rules:`, applicableRules)
  
  // Return the first matching rule (rules should be designed not to overlap)
  return applicableRules[0] || null
}

// New calculation function untuk TMT dengan FDA_Rate logic using dynamic rules
export async function calculateTMTCommissionNew(
  ndCount: number,
  position: string,
  totalAmount: number
): Promise<{ commission: number, tier: string, fdaRate: number }> {
  try {
    // Get commission rules
    const rules = await getCommissionRulesForCalculation()
    
    // Find matching rule for this position and count
    const matchingRule = findMatchingRule(rules, position, 'TMT', 'FDA_RATE', ndCount)
    
    if (matchingRule) {
      const fdaRate = matchingRule.rate_value
      const commission = (totalAmount * fdaRate) / 100
      const tier = `FDA Rate ${fdaRate}%`
      
      console.log(`Found TMT rule for ${position}: ${fdaRate}% FDA Rate`)
      
      return {
        commission,
        tier,
        fdaRate
      }
    }
    
    // Enhanced fallback logic with position-based defaults
    console.warn(`No TMT rule found for position ${position}, using fallback`)
    
    let defaultRate = 7 // Base default
    
    // Position-specific fallbacks
    if (position.toUpperCase() === 'SE2') {
      defaultRate = ndCount <= 150 ? 7 : ndCount <= 200 ? 8 : ndCount <= 235 ? 9 : 10
    } else if (position.toUpperCase() === 'SE1' || position.toUpperCase() === 'PE1') {
      defaultRate = ndCount <= 140 ? 7 : ndCount <= 190 ? 8 : ndCount <= 225 ? 9 : 10
    } else if (position.toUpperCase() === 'PE2') {
      defaultRate = 8 // Higher default for PE2
    } else if (position.toUpperCase() === 'MANAGER') {
      defaultRate = 10 // Highest default for Manager
    }
    
    const commission = (totalAmount * defaultRate) / 100
    const tier = `FDA Rate ${defaultRate}% (Fallback for ${position})`
    
    console.log(`Using fallback TMT rate for ${position}: ${defaultRate}%`)
    
    return {
      commission,
      tier,
      fdaRate: defaultRate
    }
  } catch (error) {
    console.error('Error calculating TMT commission:', error)
    
    // Even in error, provide minimal fallback
    const emergencyRate = 5 // Emergency fallback rate
    const commission = (totalAmount * emergencyRate) / 100
    
    return { 
      commission, 
      tier: `FDA Rate ${emergencyRate}% (Emergency Fallback)`, 
      fdaRate: emergencyRate 
    }
  }
}

// New calculation function untuk CRT dengan Head_Per_Count logic using dynamic rules
export async function calculateCRTCommissionNew(
  reactiveCount: number,
  position: string
): Promise<{ commission: number, tier: string, headPerCount: number }> {
  try {
    // Get commission rules
    const rules = await getCommissionRulesForCalculation()
    
    // Find matching rule for this position and count
    const matchingRule = findMatchingRule(rules, position, 'CRT', 'HEAD_PER_COUNT', reactiveCount)
    
    if (matchingRule) {
      const headPerCountUSD = matchingRule.rate_value
      
      // Calculate total commission in USD
      const totalCommissionUSD = reactiveCount * headPerCountUSD
      
      // Convert to MYR
      const commissionMYR = await convertCurrency(totalCommissionUSD, 'USD', 'MYR')
      
      const tier = `Head Count $${headPerCountUSD}`
      
      console.log(`Found CRT rule for ${position}: $${headPerCountUSD} per head`)
      
      return {
        commission: commissionMYR,
        tier,
        headPerCount: headPerCountUSD
      }
    }
    
    // Enhanced fallback logic with position-based defaults
    console.warn(`No CRT rule found for position ${position}, using fallback`)
    
    let defaultRate = 0.5 // Base default
    
    // Position-specific fallbacks
    if (position.toUpperCase() === 'SE2') {
      defaultRate = reactiveCount < 130 ? 0.5 : reactiveCount <= 160 ? 0.8 : reactiveCount <= 200 ? 0.9 : 1.0
    } else if (position.toUpperCase() === 'SE1' || position.toUpperCase() === 'PE1') {
      defaultRate = reactiveCount < 110 ? 0.5 : reactiveCount <= 140 ? 0.8 : reactiveCount <= 170 ? 0.9 : 1.0
    } else if (position.toUpperCase() === 'PE2') {
      defaultRate = 0.8 // Higher default for PE2
    } else if (position.toUpperCase() === 'MANAGER') {
      defaultRate = 1.0 // Highest default for Manager
    }
    
    const totalCommissionUSD = reactiveCount * defaultRate
    const commissionMYR = await convertCurrency(totalCommissionUSD, 'USD', 'MYR')
    const tier = `Head Count $${defaultRate} (Fallback for ${position})`
    
    console.log(`Using fallback CRT rate for ${position}: $${defaultRate} per head`)
    
    return {
      commission: commissionMYR,
      tier,
      headPerCount: defaultRate
    }
  } catch (error) {
    console.error('Error calculating CRT commission:', error)
    
    // Even in error, provide minimal fallback
    const emergencyRate = 0.3 // Emergency fallback rate in USD
    const totalCommissionUSD = reactiveCount * emergencyRate
    const commissionMYR = totalCommissionUSD * 4.7 // Direct conversion as fallback
    
    return { 
      commission: commissionMYR, 
      tier: `Head Count $${emergencyRate} (Emergency Fallback)`, 
      headPerCount: emergencyRate 
    }
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
  startDate: Date,
  endDate: Date
): Promise<CommissionData[]> {
  try {
    // Get sales data with staff and department info using correct database structure
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    console.log(`🔍 Generating commission report for period: ${startDateStr} to ${endDateStr}`)
    
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        staff:staff_id (
          id, name, position, department_id
        )
      `)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .eq('status', 'closed')

    if (salesError) {
      console.error('❌ Sales query failed:', salesError.message)
      console.log('💡 Database might not be properly set up. Try running: POST /api/add-real-sales')
      // Only return empty array instead of demo data
      return []
    }

    console.log(`📊 Found ${sales?.length || 0} sales records for the period`)
    
    // Debug: Log sample sales data
    if (sales && sales.length > 0) {
      console.log('📋 Sample sales data:', sales.slice(0, 3).map(s => ({
        id: s.id,
        customer: s.customer_name,
        amount: s.amount,
        staff_id: s.staff_id,
        staff: s.staff,
        created_at: s.created_at,
        status: s.status
      })))
    }

    if (!sales || sales.length === 0) {
      console.log('⚠️ No sales data found for the specified period')
      
      // Check if we have any sales data at all in the database
      const { data: anySales } = await supabase
        .from('sales')
        .select('id, created_at, status')
        .limit(5)
      
      if (!anySales || anySales.length === 0) {
        console.log('📅 No sales data exists in database.')
        return []
      } else {
        console.log('📅 Sales data exists but not for the selected period:')
        anySales.forEach(s => {
          console.log(`   - ID: ${s.id}, Date: ${s.created_at}, Status: ${s.status}`)
        })
        return []
      }
    }

    // Debug: Check how many sales have valid staff
    const salesWithStaff = sales.filter(sale => sale.staff && sale.staff.id)
    const salesWithoutStaff = sales.filter(sale => !sale.staff || !sale.staff.id)
    
    console.log(`📋 Sales breakdown:`)
    console.log(`   - Total sales: ${sales.length}`)
    console.log(`   - Sales with valid staff: ${salesWithStaff.length}`)
    console.log(`   - Sales without staff: ${salesWithoutStaff.length}`)
    
    if (salesWithoutStaff.length > 0) {
      console.log(`⚠️ Sales without staff:`, salesWithoutStaff.map(s => ({
        id: s.id,
        customer: s.customer_name,
        staff_id: s.staff_id,
        staff: s.staff
      })))
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

    console.log(`👥 Processing commission for ${Object.keys(staffSales).length} staff members`)
    
    if (Object.keys(staffSales).length === 0) {
      console.log(`⚠️ No sales with valid staff found. This usually means staff_id in sales table is invalid.`)
      console.log(`💡 Use the "Fix Staff IDs" button to resolve this issue.`)
      return []
    }

    const commissionData: CommissionData[] = []

    for (const [staffId, staffSalesData] of Object.entries(staffSales)) {
      try {
        const staff = staffSalesData[0].staff
        if (!staff) {
          console.log(`❌ Skipping staff ${staffId} - no staff info`)
          continue
        }

        const position = staff.position || 'Unknown'
        const department = staffSalesData[0].department || 'Unknown'

        console.log(`📊 Processing ${staff.name || 'Unknown'} (${position})...`)

      // Calculate depositor count - total unique customers for this staff
      const uniqueDepositors = new Set(staffSalesData.map(sale => sale.customer_name)).size
      
      // Calculate reactive count - total count of all CRT transactions
      const crtTransactions = staffSalesData.filter(sale => 
        sale.type === 'CRT' || sale.department === 'CRT'
      )
      const reactiveCount = crtTransactions.length
      
      // Calculate ND count - total count of unique depositors for TMT (using is_depositor flag)
      const tmtDepositors = staffSalesData.filter(sale => 
        (sale.type === 'TMT' || sale.department === 'TMT') && sale.is_depositor === true
      )
      const ndCount = new Set(tmtDepositors.map(sale => sale.customer_name)).size
      
      console.log(`   📈 ${staff.name}: ND Count=${ndCount}, Reactive Count=${reactiveCount}`)

      // Calculate depositor count
      const depositorCount = uniqueDepositors
      
      // Calculate total amounts by type (use amount or amount_in_myr, fallback to 0)
      const tmtSales = staffSalesData.filter(sale => 
        sale.type === 'TMT' || sale.department === 'TMT'
      )
      const tmtTotal = tmtSales.reduce((sum, sale) => sum + (sale.amount || sale.amount_in_myr || 0), 0)

      const crtSales = staffSalesData.filter(sale => 
        sale.type === 'CRT' || sale.department === 'CRT'
      )
      const crtTotal = crtSales.reduce((sum, sale) => sum + (sale.amount || sale.amount_in_myr || 0), 0)

      console.log(`   💰 ${staff.name}: TMT Total=RM${tmtTotal.toFixed(2)}, CRT Total=RM${crtTotal.toFixed(2)}`)

      // Calculate FDA transactions (assuming we have a way to identify FDA transactions)
      const fdaTransactions = staffSalesData.filter(sale => sale.is_fda === true).length
      
      // Calculate commissions using new logic
      const tmtResult = await calculateTMTCommissionNew(ndCount, position, tmtTotal)
      const crtResult = await calculateCRTCommissionNew(reactiveCount, position)
      
      const totalCommission = tmtResult.commission + crtResult.commission

      console.log(`   🎯 ${staff.name}: TMT Commission=RM${tmtResult.commission.toFixed(2)}, CRT Commission=RM${crtResult.commission.toFixed(2)}, Total=RM${totalCommission.toFixed(2)}`)

      // Mock KPI calculation
      const kpiScore = depositorCount * 10 + fdaTransactions * 5

      // Mock qualification criteria
      const kpiTarget = position === 'SE1' ? 100 : position === 'SE2' ? 150 : 200
      const depositorTarget = position === 'SE1' ? 10 : position === 'SE2' ? 15 : 20
      const isQualified = kpiScore >= kpiTarget && depositorCount >= depositorTarget

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
        kpiScore,
        depositorCount,
        fdaCount: fdaTransactions,
        fdaRate: tmtResult.fdaRate,
        isQualified,
        reactiveCount,
        ndCount,
        currentTier: `TMT: ${tmtResult.tier}, CRT: ${crtResult.tier}`,
        nextTier: null,
        distanceToNextTier: 0,
        headPerCount: crtResult.headPerCount
      })
      
      } catch (staffError) {
        console.error(`❌ Error processing staff ${staffId}:`, staffError)
        // Continue with next staff member
      }
    }

    console.log(`✅ Commission report generated successfully for ${commissionData.length} staff members`)
    return commissionData.sort((a, b) => b.totalCommission - a.totalCommission)
  } catch (error) {
    console.error('❌ Error generating commission report:', error)
    console.log('💡 If you see database errors, try calling: POST /api/add-real-sales to set up sample data')
    // Return empty array instead of demo data for real production use
    return []
  }
}

// Function to generate demo commission data when no real data is available
async function generateDemoCommissionData(): Promise<CommissionData[]> {
  console.log('Generating demo commission data for demonstration...')
  
  const demoData = [
    {
      staffId: 'demo-1',
      staffName: 'John Doe (SE2)',
      position: 'SE2',
      department: 'Sales',
      ndCount: 160, // TMT depositors
      reactiveCount: 145, // CRT transactions  
      depositorCount: 160,
      fdaCount: 48,
      tmtTotal: 80000,
      crtTotal: 25000,
      isQualified: true
    },
    {
      staffId: 'demo-2', 
      staffName: 'Jane Smith (SE1)',
      position: 'SE1',
      department: 'Sales',
      ndCount: 180,
      reactiveCount: 155, 
      depositorCount: 180,
      fdaCount: 54,
      tmtTotal: 95000,
      crtTotal: 30000,
      isQualified: true
    },
    {
      staffId: 'demo-3',
      staffName: 'Mike Johnson (PE1)', 
      position: 'PE1',
      department: 'Premium',
      ndCount: 210,
      reactiveCount: 185,
      depositorCount: 210, 
      fdaCount: 73,
      tmtTotal: 120000,
      crtTotal: 45000,
      isQualified: true
    },
    {
      staffId: 'demo-4',
      staffName: 'Alice Wong (SE2 - Low)',
      position: 'SE2', 
      department: 'Sales',
      ndCount: 120,
      reactiveCount: 85,
      depositorCount: 120,
      fdaCount: 24,
      tmtTotal: 35000,
      crtTotal: 15000,
      isQualified: false
    }
  ]

  const commissionData: CommissionData[] = []
  
  for (const demo of demoData) {
    // Calculate commissions using actual logic
    const tmtResult = await calculateTMTCommissionNew(demo.ndCount, demo.position, demo.tmtTotal)
    const crtResult = await calculateCRTCommissionNew(demo.reactiveCount, demo.position)
    
    commissionData.push({
      ...demo,
      tmtCommission: tmtResult.commission,
      crtCommission: crtResult.commission,
      totalCommission: tmtResult.commission + crtResult.commission,
      kpiScore: demo.depositorCount * 10 + demo.fdaCount * 5,
      fdaRate: tmtResult.fdaRate,
      currentTier: `TMT: ${tmtResult.tier}, CRT: ${crtResult.tier}`,
      nextTier: null,
      distanceToNextTier: 0,
      headPerCount: crtResult.headPerCount
    })
  }

  return commissionData.sort((a, b) => b.totalCommission - a.totalCommission)
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