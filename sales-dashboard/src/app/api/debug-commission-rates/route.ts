import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug Commission Rates...')

    // 1. Ambil semua commission rates
    const { data: commissionRates, error: ratesError } = await supabase
      .from('commission_rates')
      .select('*')

    if (ratesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get commission rates',
        details: ratesError.message
      }, { status: 500 })
    }

    // 2. Ambil staff data
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

    // 3. Test parsing count_range
    const testParsing = commissionRates?.map(rate => {
      let parsedRange = null
      if (rate.count_range) {
        const [minStr, maxStr] = rate.count_range.split(' - ')
        const min = parseInt(minStr) || 0
        const max = maxStr === '∞' ? Infinity : parseInt(maxStr) || Infinity
        parsedRange = { min, max, original: rate.count_range }
      }
      
      return {
        id: rate.id,
        position: rate.position,
        count_range: rate.count_range,
        tmt_rate: rate.tmt_rate,
        crt_rate: rate.crt_rate,
        is_active: rate.is_active,
        parsedRange
      }
    })

    // 4. Test untuk SE1 dengan 1 depositor (KAREN case)
    const se1Rates = commissionRates?.filter(rate => 
      rate.position === 'SE1' && rate.is_active
    ) || []

    const se1TestResults = se1Rates.map(rate => {
      let matchTest = false
      if (rate.count_range) {
        const [minStr, maxStr] = rate.count_range.split(' - ')
        const min = parseInt(minStr) || 0
        const max = maxStr === '∞' ? Infinity : parseInt(maxStr) || Infinity
        
        // Test dengan 1 depositor (KAREN)
        matchTest = 1 >= min && 1 <= max
      }
      
      return {
        count_range: rate.count_range,
        tmt_rate: rate.tmt_rate,
        matchFor1Depositor: matchTest,
        min: parseInt(rate.count_range?.split(' - ')[0] || '0'),
        max: rate.count_range?.split(' - ')[1] === '∞' ? 'Infinity' : parseInt(rate.count_range?.split(' - ')[1] || '0')
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalCommissionRates: commissionRates?.length || 0,
        totalStaff: staff?.length || 0,
        allCommissionRates: commissionRates,
        staffList: staff?.map(s => ({ name: s.name, position: s.position })),
        testParsing: testParsing,
        se1Analysis: {
          totalSE1Rates: se1Rates.length,
          se1Rates: se1Rates,
          se1TestResults: se1TestResults,
          expectedMatch: se1TestResults.find(r => r.matchFor1Depositor)
        }
      }
    })

  } catch (error) {
    console.error('❌ Debug commission rates error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to debug commission rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 