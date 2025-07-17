import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Sale } from '@/lib/models/Sales'
import { calculateKPIScore } from '@/lib/utils/commission'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999)
    
    const sales = await Sale.find({
      date: { $gte: start, $lte: end },
      status: 'closed'
    }).populate('staffId')

    // Group sales by staff
    const staffSales: { [key: string]: any[] } = {}
    sales.forEach((sale: any) => {
      const staffId = sale.staffId._id.toString()
      if (!staffSales[staffId]) {
        staffSales[staffId] = []
      }
      staffSales[staffId].push(sale)
    })

    const kpiData = []

    for (const [staffId, staffSalesData] of Object.entries(staffSales)) {
      const staff = staffSalesData[0].staffId
      const position = staff.position

      const kpiMetrics = await calculateKPIScore(staffSalesData, position)
      
      const tmtTotal = staffSalesData
        .filter(sale => sale.type === 'TMT')
        .reduce((sum, sale) => sum + sale.amountInMYR, 0)

      const crtTotal = staffSalesData
        .filter(sale => sale.type === 'CRT')
        .reduce((sum, sale) => sum + sale.amountInMYR, 0)

      kpiData.push({
        staffId,
        staffName: staff.name,
        position,
        tmtTotal,
        crtTotal,
        totalSales: tmtTotal + crtTotal,
        salesCount: staffSalesData.length,
        ...kpiMetrics
      })
    }

    return NextResponse.json({
      success: true,
      data: kpiData,
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    })
  } catch (error) {
    console.error('Error generating KPI report:', error)
    return NextResponse.json(
      { error: 'Failed to generate KPI report' },
      { status: 500 }
    )
  }
} 