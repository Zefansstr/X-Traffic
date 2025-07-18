'use client'

import { useState, useEffect } from 'react'

interface AdvancedCommissionRule {
  id?: string
  position: string
  department: string
  type: 'FDA_RATE' | 'HEAD_PER_COUNT'
  min_count: number
  max_count: number | null
  rate_value: number
  currency: 'MYR' | 'USD'
  is_active: boolean
}

export default function CommissionRatesPage() {
  const [advancedRules, setAdvancedRules] = useState<AdvancedCommissionRule[]>([])
  const [advancedFormData, setAdvancedFormData] = useState({
    position: 'SE1',
    department: 'TMT',
    type: 'FDA_RATE' as 'FDA_RATE' | 'HEAD_PER_COUNT',
    min_count: 0,
    max_count: null as number | null,
    rate_value: 0,
    currency: 'MYR' as 'MYR' | 'USD'
  })
  const [loading, setLoading] = useState(false)

  const positions = ['SE1', 'SE2', 'PE1', 'PE2', 'Manager']
  const departments = ['TMT', 'CRT']

  useEffect(() => {
    fetchAdvancedRules()
  }, [])

  const fetchAdvancedRules = async () => {
    try {
      // Try to load from localStorage first
      const savedRules = localStorage.getItem('advancedCommissionRules')
      if (savedRules) {
        setAdvancedRules(JSON.parse(savedRules))
        return
      }

      // If no saved rules, use initial sample data
      const sampleRules: AdvancedCommissionRule[] = [
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
        // SE1 & PE1 CRT Rules
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
        }
      ]
      // Save initial sample rules to localStorage and set state
      localStorage.setItem('advancedCommissionRules', JSON.stringify(sampleRules))
      setAdvancedRules(sampleRules)
    } catch (error) {
      console.error('Error fetching advanced rules:', error)
    }
  }

  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      if (advancedFormData.rate_value <= 0) {
        alert('Rate Value must be greater than 0')
        setLoading(false)
        return
      }

      if (advancedFormData.max_count !== null && advancedFormData.max_count <= advancedFormData.min_count) {
        alert('Max Count must be greater than Min Count')
        setLoading(false)
        return
      }

      // Create new rule with unique ID
      const newRule: AdvancedCommissionRule = {
        id: Date.now().toString(),
        position: advancedFormData.position,
        department: advancedFormData.department,
        type: advancedFormData.type,
        min_count: advancedFormData.min_count,
        max_count: advancedFormData.max_count,
        rate_value: advancedFormData.rate_value,
        currency: advancedFormData.currency,
        is_active: true
      }
      
      // Add to existing rules
      const updatedRules = [...advancedRules, newRule]
      setAdvancedRules(updatedRules)
      
      // Save to localStorage
      localStorage.setItem('advancedCommissionRules', JSON.stringify(updatedRules))
      
      console.log('New advanced rule added:', newRule)
      
      // Reset form
      setAdvancedFormData({
        position: 'SE1',
        department: 'TMT',
        type: 'FDA_RATE',
        min_count: 0,
        max_count: null,
        rate_value: 0,
        currency: 'MYR'
      })
      
      alert('Advanced commission rule added successfully!')
    } catch (error) {
      console.error('Error saving advanced rule:', error)
      alert('An error occurred while saving the rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      const updatedRules = advancedRules.filter(rule => rule.id !== id)
      setAdvancedRules(updatedRules)
      
      // Save to localStorage
      localStorage.setItem('advancedCommissionRules', JSON.stringify(updatedRules))
      
      alert('Rule deleted successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Advanced Commission Rules Management</h1>
          
          {/* Advanced Form */}
          <form onSubmit={handleAdvancedSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                <select
                  value={advancedFormData.position}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select
                  value={advancedFormData.department}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={advancedFormData.type}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, type: e.target.value as 'FDA_RATE' | 'HEAD_PER_COUNT'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="FDA_RATE">FDA Rate</option>
                  <option value="HEAD_PER_COUNT">Head Per Count</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Count *</label>
                <input
                  type="number"
                  min="0"
                  value={advancedFormData.min_count}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, min_count: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                <input
                  type="number"
                  min="0"
                  value={advancedFormData.max_count || ''}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, max_count: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate Value *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={advancedFormData.rate_value}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, rate_value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                <select
                  value={advancedFormData.currency}
                  onChange={(e) => setAdvancedFormData({...advancedFormData, currency: e.target.value as 'MYR' | 'USD'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="MYR">MYR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Add Advanced Rule'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Advanced Rules Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Advanced Commission Rules</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advancedRules.map((rule, index) => (
                  <tr key={rule.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rule.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.type === 'FDA_RATE' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rule.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.min_count} - {rule.max_count || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {rule.rate_value}{rule.type === 'FDA_RATE' ? '%' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(rule.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                
                {advancedRules.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No advanced rules configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Advanced Commission Rules Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-3">🎯 Commission Logic:</h4>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-800">SE2 CRT (Reactive Count):</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div>• &lt; 130: $0.5 per head</div>
                    <div>• 131-160: $0.8 per head</div>
                    <div>• 161-200: $0.9 per head</div>
                    <div>• ≥ 201: $1.0 per head</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-800">SE2 TMT (ND Count):</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div>• ≤ 150: 7% FDA Rate</div>
                    <div>• 151-200: 8% FDA Rate</div>
                    <div>• 201-235: 9% FDA Rate</div>
                    <div>• ≥ 236: 10% FDA Rate</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">📊 SE1 & PE1 Logic:</h4>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-800">SE1/PE1 CRT (Reactive Count):</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div>• &lt; 110: $0.5 per head</div>
                    <div>• 111-140: $0.8 per head</div>
                    <div>• 141-170: $0.9 per head</div>
                    <div>• ≥ 171: $1.0 per head</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-800">SE1/PE1 TMT (ND Count):</div>
                  <div className="text-xs space-y-1 mt-1">
                    <div>• ≤ 140: 7% FDA Rate</div>
                    <div>• 141-190: 8% FDA Rate</div>
                    <div>• 191-225: 9% FDA Rate</div>
                    <div>• ≥ 226: 10% FDA Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600">
            <strong>Note:</strong> USD amounts are automatically converted to MYR using current exchange rates. 
            ND Count = New Depositors, Reactive Count = Active Members.
          </div>
        </div>
      </div>
    </div>
  )
} 