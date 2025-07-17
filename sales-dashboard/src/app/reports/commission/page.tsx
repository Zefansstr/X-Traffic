'use client'

import { useState, useEffect, useCallback } from 'react'

interface CommissionData {
  staffId: string
  staffName: string
  position: string
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
}

export default function CommissionReportPage() {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalTMT, setTotalTMT] = useState(0)
  const [totalCRT, setTotalCRT] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(0)

  // Set default dates (current month)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const fetchCommissionReport = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/reports/commission?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      
      if (data.success) {
        setCommissionData(data.data)
        
        // Calculate totals
        const tmt = data.data.reduce((sum: number, item: CommissionData) => sum + item.tmtTotal, 0)
        const crt = data.data.reduce((sum: number, item: CommissionData) => sum + item.crtTotal, 0)
        const commission = data.data.reduce((sum: number, item: CommissionData) => sum + item.totalCommission, 0)
        
        setTotalTMT(tmt)
        setTotalCRT(crt)
        setTotalCommission(commission)
        setEmployeeCount(data.data.length)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error fetching commission report:', error)
      alert('Error fetching commission report')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (startDate && endDate) {
      fetchCommissionReport()
    }
  }, [startDate, endDate, fetchCommissionReport])

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
                onClick={fetchCommissionReport}
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
            <div className="text-sm font-medium text-gray-500">Employee Count</div>
            <div className="text-2xl font-bold text-gray-900">{employeeCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total TMT</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalTMT)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total CRT</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCRT)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Commission</div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommission)}</div>
          </div>
        </div>

        {/* Commission Report Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Commission Report ({formatDate(startDate)} - {formatDate(endDate)})
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
                    Total KPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Depositor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total FDA
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
                    Total Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissionData.map((item, index) => (
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
                      {item.kpiScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.depositorCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.fdaCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.fdaRate.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.tmtTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.crtTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.totalCommission)}
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
          
          {commissionData.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-gray-500">
              No commission data available for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 