'use client'

import { useState, useEffect } from 'react'

interface CommissionRate {
  _id: string
  position: string
  tmtRate: number
  crtRate: number
  kpiTarget: number
  depositorTarget: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CommissionRatesPage() {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([])
  const [formData, setFormData] = useState({
    position: 'SE1',
    tmtRate: 0,
    crtRate: 0,
    kpiTarget: 0,
    depositorTarget: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const positions = ['SE1', 'SE2', 'PE1', 'PE2', 'Manager']

  useEffect(() => {
    fetchCommissionRates()
  }, [])

  const fetchCommissionRates = async () => {
    try {
      const response = await fetch('/api/commission-rates')
      if (response.ok) {
        const data = await response.json()
        setCommissionRates(data)
      }
    } catch (error) {
      console.error('Error fetching commission rates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/commission-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          position: 'SE1',
          tmtRate: 0,
          crtRate: 0,
          kpiTarget: 0,
          depositorTarget: 0
        })
        setEditingId(null)
        fetchCommissionRates()
        alert('Commission rate saved successfully!');
      } else {
        const error = await response.json()
        alert('Failed to save commission rate: ' + error.error)
      }
    } catch (error) {
      console.error('Error saving commission rate:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rate: CommissionRate) => {
    setFormData({
      position: rate.position,
      tmtRate: rate.tmtRate,
      crtRate: rate.crtRate,
      kpiTarget: rate.kpiTarget,
      depositorTarget: rate.depositorTarget
    })
    setEditingId(rate._id)
  }

  const handleCancel = () => {
    setFormData({
      position: 'SE1',
      tmtRate: 0,
      crtRate: 0,
      kpiTarget: 0,
      depositorTarget: 0
    })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Commission Rates Management</h1>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  required
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TMT Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tmtRate}
                  onChange={(e) => setFormData({...formData, tmtRate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRT Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.crtRate}
                  onChange={(e) => setFormData({...formData, crtRate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KPI Target *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.kpiTarget}
                  onChange={(e) => setFormData({...formData, kpiTarget: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depositor Target *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.depositorTarget}
                  onChange={(e) => setFormData({...formData, depositorTarget: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editingId ? 'Update Rate' : 'Add Rate'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Commission Rates Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Commission Rates</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TMT Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CRT Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depositor Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissionRates.map((rate, index) => (
                  <tr key={rate._id || `rate-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {rate.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.tmtRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.crtRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.kpiTarget}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.depositorTarget}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                
                {commissionRates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No commission rates configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Commission Rates Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Position Levels:</h4>
              <ul className="space-y-1">
                <li>• <strong>SE1:</strong> Sales Executive Level 1</li>
                <li>• <strong>SE2:</strong> Sales Executive Level 2</li>
                <li>• <strong>PE1:</strong> Private Executive Level 1</li>
                <li>• <strong>PE2:</strong> Private Executive Level 2</li>
                <li>• <strong>Manager:</strong> Sales Manager</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Commission Types:</h4>
              <ul className="space-y-1">
                <li>• <strong>TMT Rate:</strong> Commission percentage for TMT sales</li>
                <li>• <strong>CRT Rate:</strong> Commission percentage for CRT sales</li>
                <li>• <strong>KPI Target:</strong> Minimum KPI score required</li>
                <li>• <strong>Depositor Target:</strong> Minimum depositor count required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 