import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { generateCommissionReport } from '@/lib/utils/commission'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    console.log('📊 Commission API called with:', { startDate, endDate })
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999)
    
    console.log('📅 Processed dates:', { 
      start: start.toISOString(), 
      end: end.toISOString() 
    })
    
    const commissionData = await generateCommissionReport(start, end)
    
    console.log('✅ Commission data generated:', commissionData.length, 'records')
    
    return NextResponse.json({
      success: true,
      data: commissionData,
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      debug: {
        recordCount: commissionData.length,
        dateFilter: { startDate, endDate }
      }
    })
  } catch (error) {
    console.error('❌ Error generating commission report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate commission report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
 