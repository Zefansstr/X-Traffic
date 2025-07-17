'use client'

import { useState, useEffect, useCallback } from 'react'

interface KPIData {
  staffId: string
  staffName: string
  position: string
  tmtTotal: number
  crtTotal: number
  totalSales: number
  salesCount: number
  kpiScore: number
  depositorCount: number
  fdaCount: number
  fdaRate: number
  isQualified: boolean
}

export default function KPIReportPage() {
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalSales, setTotalSales] = useState(0)
  const [totalDepositors, setTotalDepositors] = useState(0)
  const [totalFDA, setTotalFDA] = useState(0)
  const [averageKPI, setAverageKPI] = useState(0)

  // Set default dates (current month)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const fetchKPIReport = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/reports/kpi?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      
      if (data.success) {
        setKpiData(data.data)
        
        // Calculate totals
        const sales = data.data.reduce((sum: number, item: KPIData) => sum + item.totalSales, 0)
        const depositors = data.data.reduce((sum: number, item: KPIData) => sum + item.depositorCount, 0)
        const fda = data.data.reduce((sum: number, item: KPIData) => sum + item.fdaCount, 0)
        const avgKPI = data.data.length > 0 ? data.data.reduce((sum: number, item: KPIData) => sum + item.kpiScore, 0) / data.data.length : 0
        
        setTotalSales(sales)
        setTotalDepositors(depositors)
        setTotalFDA(fda)
        setAverageKPI(avgKPI)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error fetching KPI report:', error)
      alert('Error fetching KPI report')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (startDate && endDate) {
      fetchKPIReport()
    }
  }, [startDate, endDate, fetchKPIReport])

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KPI Report</h1>
          <p className="text-gray-600">
            Laporan Key Performance Indicator dengan tracking depositor dan FDA rate
          </p>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <button
                onClick={fetchKPIReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Sales</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Depositors</div>
            <div className="text-2xl font-bold text-blue-600">{totalDepositors}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total FDA</div>
            <div className="text-2xl font-bold text-purple-600">{totalFDA}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Average KPI</div>
            <div className="text-2xl font-bold text-orange-600">{averageKPI.toFixed(2)}</div>
          </div>
        </div>

        {/* KPI Report Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              KPI Report ({formatDate(startDate)} - {formatDate(endDate)})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name of Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depositor Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FDA Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FDA Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TMT (RM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CRT (RM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kpiData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.staffName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.kpiScore}</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(item.kpiScore, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.depositorCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.fdaCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.fdaRate.toFixed(2)}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(item.fdaRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.tmtTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.crtTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.salesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isQualified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isQualified ? 'Qualified' : 'Not Qualified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {kpiData.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-gray-500">
              No KPI data available for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 