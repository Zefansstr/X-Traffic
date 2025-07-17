'use client'

import { useState, useEffect, useCallback } from 'react'

interface AgentData {
  agentId: string
  agentName: string
  position: string
  tmtTotal: number
  crtTotal: number
  totalSales: number
  depositorCount: number
  tmtDepositorCount: number
  crtDepositorCount: number
  tmtSalesCount: number
  crtSalesCount: number
  salesCount: number
}

interface StaffData {
  staffId: string
  staffName: string
  position: string
  agentData?: AgentData[]
  totalTMT?: number
  totalCRT?: number
  totalSales: number
  totalDepositors?: number
  totalSalesCount?: number
  tmtTotal?: number
  crtTotal?: number
  tmtSalesCount?: number
  crtSalesCount?: number
  depositorCount?: number
  tmtDepositorCount?: number
  crtDepositorCount?: number
  fdaCount?: number
  salesCount?: number
}

interface OverallData {
  summary: {
    totalTMT: number
    totalCRT: number
    totalSales: number
    totalDepositors: number
    totalFDA: number
    totalTMTSalesCount: number
    totalCRTSalesCount: number
    totalTMTDepositors?: number
    totalCRTDepositors?: number
  }
  staffData: StaffData[]
  isAgentBreakdown: boolean
  salesData: Array<{
    id: string
    customerName: string
    staffName: string
    agentName: string
    amount: number
    type: string
    date: string
    isDepositor: boolean
    isFDA: boolean
  }>
}

interface Staff {
  id: string
  name: string
  position: string
}

export default function OverallReportPage() {
  const [overallData, setOverallData] = useState<OverallData | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Set default dates (today)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
  }, [])

  // Fetch staff list for category dropdown
  useEffect(() => {
    fetchStaffList()
  }, [])

  const fetchStaffList = async () => {
    try {
      console.log('Fetching staff list...')
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        console.log('Raw staff data:', data)
        
        const staffData = data.success ? data.data : data
        console.log('Staff data to be used:', staffData)
        
        setStaffList(staffData)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  const fetchOverallReport = useCallback(async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      let url = `/api/reports/overall?startDate=${startDate}&endDate=${endDate}`
      if (selectedCategory !== 'all') {
        url += `&staffId=${selectedCategory}`
      }
      
      console.log('Fetching overall report from:', url)
      console.log('Selected category:', selectedCategory)
      console.log('Staff list:', staffList)
      
      const response = await fetch(url)
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      if (data.success) {
        setOverallData(data.data)
      } else {
        console.error('API returned error:', data.error)
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error fetching overall report:', error)
      alert('Error fetching overall report: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, selectedCategory])

  useEffect(() => {
    if (startDate && endDate) {
      fetchOverallReport()
    }
  }, [startDate, endDate, selectedCategory, fetchOverallReport])

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getSelectedStaffName = () => {
    if (selectedCategory === 'all') return 'All Report'
    const staff = staffList.find(s => s.id === selectedCategory)
    return staff ? staff.name : 'Selected Staff'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Date and Category Filter */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  console.log('Dropdown selection changed to:', e.target.value)
                  setSelectedCategory(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">All Report</option>
                {staffList.map((staff, index) => (
                  <option 
                    key={staff.id || `staff-${index}`} 
                    value={staff.id}
                  >
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <button
                onClick={fetchOverallReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {overallData && (
          <div className="space-y-6">
            {/* Grand Total - 2 rows of 3 cards each */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Grand Total - {getSelectedStaffName()}
              </h2>
              
              {/* First Row - FDA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-green-600 text-sm font-medium">TMT Total FDA</div>
                  <div className="text-2xl font-bold text-green-800">
                    {formatCurrency(overallData.summary.totalTMT || 0)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium">CRT Total FDA</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {formatCurrency(overallData.summary.totalCRT || 0)}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-sm font-medium">Total Sales</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {formatCurrency(overallData.summary.totalSales || 0)}
                  </div>
                </div>
              </div>

              {/* Second Row - Depositor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-green-600 text-sm font-medium">TMT Total Depositor</div>
                  <div className="text-2xl font-bold text-green-800">
                    {overallData.summary.totalTMTDepositors || 0}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium">CRT Total Depositor</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {overallData.summary.totalCRTDepositors || 0}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-sm font-medium">Total Depositor</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {overallData.summary.totalDepositors || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Agent Performance
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TMT FDA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CRT FDA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          TMT Depositor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          CRT Depositor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Total Depositor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overallData.staffData.map((staff, staffIndex) => 
                        staff.agentData?.map((agent, agentIndex) => (
                          <tr key={`${staff.staffId}-${agent.agentId}-${staffIndex}-${agentIndex}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {agent.agentName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(agent.tmtTotal || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">
                                {formatCurrency(agent.crtTotal || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                              {agent.tmtDepositorCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                              {agent.crtDepositorCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                              {agent.depositorCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(agent.totalSales || 0)}
                              </div>
                            </td>
                          </tr>
                        )) || []
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading report data...</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !overallData && startDate && endDate && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No data available for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  )
} 