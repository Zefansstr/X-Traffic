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
  reactiveCount: number
  ndCount: number
  headPerCount: number
  currentTier: string
}

type TabType = 'commission' | 'tmt' | 'crt'

export default function CommissionReportPage() {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalTMT, setTotalTMT] = useState(0)
  const [totalCRT, setTotalCRT] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('commission')

  // Exchange rates
  const USD_TO_MYR_RATE = 4.7
  const MYR_TO_USD_RATE = 1 / USD_TO_MYR_RATE
  const USD_TO_IDR_RATE = 15800 // Example rate
  const MYR_TO_IDR_RATE = USD_TO_IDR_RATE / USD_TO_MYR_RATE

  // Set default dates (allow user to choose any date range)
  useEffect(() => {
    // Start with empty dates to let user choose freely
    setStartDate('')
    setEndDate('')
  }, [])

  const fetchCommissionReport = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      // Gunakan API yang simpel
      const response = await fetch(
        `/api/reports/commission-simple?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      
      console.log('📊 Commission Simple Response:', data)
      
      if (data.success) {
        setCommissionData(data.data)
        
        // Calculate totals COMMISSION (bukan amount)
        const tmtCommissionTotal = data.data.reduce((sum: number, item: any) => sum + (item.tmtCommission || 0), 0)
        const crtCommissionTotal = data.data.reduce((sum: number, item: any) => sum + (item.crtCommission || 0), 0)
        const totalCommissionSum = data.data.reduce((sum: number, item: any) => sum + (item.totalCommission || 0), 0)
        
        setTotalTMT(tmtCommissionTotal)
        setTotalCRT(crtCommissionTotal)
        setTotalCommission(totalCommissionSum)
        setEmployeeCount(data.data.length)

        // Show advanced tier logic info
        console.log('🎯 ADVANCED TIER-BASED Commission Logic Applied:', data.debug?.commissionLogic)
        console.log('📊 Sample Calculations:', data.debug?.sampleCalculations)
        
      } else {
        console.error('Commission API Error:', data)
      }
    } catch (error) {
      console.error('Error fetching commission report:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (startDate && endDate) {
      fetchCommissionReport()
    }
  }, [startDate, endDate, fetchCommissionReport])

  const formatCurrency = (amount: number, currency: string = 'RM') => {
    return `${currency} ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const convertToUSD = (myrAmount: number) => {
    return myrAmount * MYR_TO_USD_RATE
  }

  const convertToIDR = (myrAmount: number) => {
    return myrAmount * MYR_TO_IDR_RATE
  }

  const calculateDistanceToNextTier = (position: string, currentCount: number, type: 'tmt' | 'crt') => {
    if (type === 'tmt') {
      if (position === 'SE2') {
        if (currentCount <= 150) return 151 - currentCount
        if (currentCount <= 200) return 201 - currentCount
        if (currentCount <= 235) return 236 - currentCount
        return 0
      } else { // SE1/PE1
        if (currentCount <= 140) return 141 - currentCount
        if (currentCount <= 190) return 191 - currentCount
        if (currentCount <= 225) return 226 - currentCount
        return 0
      }
    } else { // CRT
      if (position === 'SE2') {
        if (currentCount < 130) return 131 - currentCount
        if (currentCount <= 160) return 161 - currentCount
        if (currentCount <= 200) return 201 - currentCount
        return 0
      } else { // SE1/PE1
        if (currentCount < 110) return 111 - currentCount
        if (currentCount <= 140) return 141 - currentCount
        if (currentCount <= 170) return 171 - currentCount
        return 0
      }
    }
  }

  const TabButton = ({ tab, label, isActive, onClick }: { 
    tab: TabType, 
    label: string, 
    isActive: boolean, 
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  const renderCommissionTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Staff Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Position</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">TMT Commission</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">CRT Commission</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Commission</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">USD</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">IDR</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {commissionData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{item.staffName}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.position === 'SE2' ? 'bg-blue-100 text-blue-800' :
                  item.position === 'SE1' ? 'bg-green-100 text-green-800' :
                  item.position === 'PE1' ? 'bg-orange-100 text-orange-800' :
                  item.position === 'PE2' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.position}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-green-600">
                {formatCurrency(item.tmtCommission || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-blue-600">
                {formatCurrency(item.crtCommission || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-purple-600">
                {formatCurrency(item.totalCommission)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                ${convertToUSD(item.totalCommission).toFixed(2)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                IDR {convertToIDR(item.totalCommission).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderTMTTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Staff Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Position</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ND Count</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">TMT Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">FDA Rate</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">TMT Commission</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Next Tier</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {commissionData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{item.staffName}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.position === 'SE2' ? 'bg-blue-100 text-blue-800' :
                  item.position === 'SE1' ? 'bg-green-100 text-green-800' :
                  item.position === 'PE1' ? 'bg-orange-100 text-orange-800' :
                  item.position === 'PE2' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.position}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-blue-600">
                {item.ndCount || (item as any).totalDepositors || 0}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                {formatCurrency((item as any).tmtAmount || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-green-600">
                {((item as any).commissionRate || 0).toFixed(1)}%
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-green-600">
                {formatCurrency(item.tmtCommission || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-orange-600">
                {calculateDistanceToNextTier(item.position, item.ndCount, 'tmt') || 'Max Tier'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCRTTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Staff Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Position</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Reactive Count</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">CRT Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">HPC Rate</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">CRT Commission</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Next Tier</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {commissionData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{item.staffName}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.position === 'SE2' ? 'bg-blue-100 text-blue-800' :
                  item.position === 'SE1' ? 'bg-green-100 text-green-800' :
                  item.position === 'PE1' ? 'bg-orange-100 text-orange-800' :
                  item.position === 'PE2' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.position}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-green-600">
                {item.reactiveCount || 0}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                {formatCurrency((item as any).crtAmount || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-orange-600">
                ${item.headPerCount?.toFixed(2) || '0.00'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-blue-600">
                {formatCurrency(item.crtCommission || 0)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-orange-600">
                {calculateDistanceToNextTier(item.position, item.reactiveCount, 'crt') || 'Max Tier'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
          <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 py-4">
        {/* Date Filter */}
        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Select any date range to generate commission report</p>
            
            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                onClick={() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const month = now.getMonth() + 1 // getMonth() returns 0-11, so add 1
                  
                  // Format as YYYY-MM-DD to avoid timezone issues
                  const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`
                  
                  // Get last day of current month
                  const lastDayOfMonth = new Date(year, month, 0).getDate()
                  const lastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`
                  
                  setStartDate(firstDay)
                  setEndDate(lastDay)
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const currentMonth = now.getMonth() + 1
                  
                  // Calculate last month (handle year rollover)
                  let lastMonth = currentMonth - 1
                  let lastMonthYear = year
                  if (lastMonth === 0) {
                    lastMonth = 12
                    lastMonthYear = year - 1
                  }
                  
                  // Format as YYYY-MM-DD
                  const firstDay = `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`
                  
                  // Get last day of last month
                  const lastDayOfMonth = new Date(lastMonthYear, lastMonth, 0).getDate()
                  const lastDay = `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`
                  
                  setStartDate(firstDay)
                  setEndDate(lastDay)
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Last Month
              </button>
              <button
                onClick={() => {
                  const now = new Date()
                  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                  
                  // Format dates to avoid timezone issues
                  const formatDate = (date: Date) => {
                    const year = date.getFullYear()
                    const month = (date.getMonth() + 1).toString().padStart(2, '0')
                    const day = date.getDate().toString().padStart(2, '0')
                    return `${year}-${month}-${day}`
                  }
                  
                  setStartDate(formatDate(sevenDaysAgo))
                  setEndDate(formatDate(now))
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Clear Dates
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                placeholder="Select end date"
              />
            </div>
            <div>
              <button
                onClick={fetchCommissionReport}
                disabled={loading}
                className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Count</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{employeeCount}</div>
          </div>
          
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total TMT Commission</div>
            <div className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalTMT)}</div>
          </div>
          
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total CRT Commission</div>
            <div className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalCRT)}</div>
          </div>
          
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commission</div>
            <div className="text-xl font-bold text-purple-600 mt-1">{formatCurrency(totalCommission)}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1">
              <TabButton 
                tab="commission" 
                label="Overall Commission" 
                isActive={activeTab === 'commission'} 
                onClick={() => setActiveTab('commission')} 
              />
              <TabButton 
                tab="tmt" 
                label="TMT Commission" 
                isActive={activeTab === 'tmt'} 
                onClick={() => setActiveTab('tmt')} 
              />
              <TabButton 
                tab="crt" 
                label="CRT Commission" 
                isActive={activeTab === 'crt'} 
                onClick={() => setActiveTab('crt')} 
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {activeTab === 'commission' && 'Commission Report'}
              {activeTab === 'tmt' && 'TMT Commission Report'}
              {activeTab === 'crt' && 'CRT Commission Report'}
              {' '}({formatDate(startDate)} - {formatDate(endDate)})
            </h2>

            {commissionData.length === 0 && !loading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No commission data available</div>
                <p className="text-sm mb-4">No sales data found for the selected period</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
                  <p className="text-sm font-medium mb-2">Advanced Tier-Based Commission Logic:</p>
                  <div className="text-sm text-left space-y-1 max-w-2xl mx-auto">
                    <p><strong>SE2 TMT:</strong> ≤150(7%), 151-200(8%), 201-235(9%), ≥236(10%)</p>
                    <p><strong>SE2 CRT:</strong> &lt;130($0.5), 131-160($0.8), 161-200($0.9), ≥201($1.0)</p>
                    <p><strong>SE1/PE1 TMT:</strong> ≤140(7%), 141-190(8%), 191-225(9%), ≥226(10%)</p>
                    <p><strong>SE1/PE1 CRT:</strong> &lt;110($0.5), 111-140($0.8), 141-170($0.9), ≥171($1.0)</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'commission' && renderCommissionTable()}
                {activeTab === 'tmt' && renderTMTTable()}
                {activeTab === 'crt' && renderCRTTable()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 