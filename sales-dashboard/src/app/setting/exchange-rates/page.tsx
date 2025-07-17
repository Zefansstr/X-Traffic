'use client'

import { useState, useEffect } from 'react'

interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ExchangeRatesPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [formData, setFormData] = useState({
    from_currency: 'USD',
    to_currency: 'MYR',
    rate: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const currencies = ['MYR', 'USD', 'IDR']

  useEffect(() => {
    fetchExchangeRates()
  }, [])

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates')
      if (response.ok) {
        const result = await response.json()
        // Handle new API format: { success: true, data: [...] }
        if (result.success && result.data) {
          setExchangeRates(result.data)
        } else {
          // Fallback for old format (direct array)
          setExchangeRates(result)
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.from_currency === formData.to_currency) {
      alert('From currency and To currency cannot be the same!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          from_currency: 'USD',
          to_currency: 'MYR',
          rate: 0
        })
        setEditingId(null)
        fetchExchangeRates()
        alert('Exchange rate berhasil disimpan!')
      } else {
        const error = await response.json()
        alert('Gagal menyimpan exchange rate: ' + error.error)
      }
    } catch (error) {
      console.error('Error saving exchange rate:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rate: ExchangeRate) => {
    setFormData({
      from_currency: rate.from_currency,
      to_currency: rate.to_currency,
      rate: rate.rate
    })
    setEditingId(rate.id)
  }

  const handleCancel = () => {
    setFormData({
      from_currency: 'USD',
      to_currency: 'MYR',
      rate: 0
    })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exchange rate?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/exchange-rates?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchExchangeRates()
        alert('Exchange rate berhasil dihapus!')
      } else {
        const error = await response.json()
        alert('Gagal menghapus exchange rate: ' + error.error)
      }
    } catch (error) {
      console.error('Error deleting exchange rate:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentRate = (from: string, to: string) => {
    const rate = exchangeRates.find(r => r.from_currency === from && r.to_currency === to)
    return rate ? rate.rate : 'Not set'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Exchange Rates Management</h1>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Currency *
                </label>
                <select
                  value={formData.from_currency}
                  onChange={(e) => setFormData({ ...formData, from_currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Currency *
                </label>
                <select
                  value={formData.to_currency}
                  onChange={(e) => setFormData({ ...formData, to_currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exchange Rate *
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="e.g., 4.7073"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Exchange Rate' : 'Add Exchange Rate'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Current Rates Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Exchange Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">USD → MYR</div>
                <div className="text-2xl font-bold text-green-700">{getCurrentRate('USD', 'MYR')}</div>
                <div className="text-xs text-green-500">US Dollar to Malaysian Ringgit</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600">IDR → MYR</div>
                <div className="text-2xl font-bold text-blue-700">{getCurrentRate('IDR', 'MYR')}</div>
                <div className="text-xs text-blue-500">Indonesian Rupiah to Malaysian Ringgit</div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">MYR → USD</div>
                <div className="text-2xl font-bold text-purple-700">{getCurrentRate('MYR', 'USD')}</div>
                <div className="text-xs text-purple-500">Malaysian Ringgit to US Dollar</div>
              </div>
            </div>
          </div>

          {/* Exchange Rates Table */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Exchange Rates</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">From Currency</th>
                    <th className="px-4 py-2 text-left">To Currency</th>
                    <th className="px-4 py-2 text-left">Exchange Rate</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Last Updated</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate) => (
                    <tr key={rate.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rate.from_currency}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rate.to_currency}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-lg font-bold text-gray-900">{rate.rate.toFixed(4)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rate.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(rate.updated_at).toLocaleDateString('id-ID')}
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(rate.updated_at).toLocaleTimeString('id-ID')}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {exchangeRates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No exchange rates configured yet.
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">💱 Exchange Rates Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <h4 className="font-medium mb-2">Supported Currencies:</h4>
              <ul className="space-y-1">
                <li>• <strong>MYR:</strong> Malaysian Ringgit (Base Currency)</li>
                <li>• <strong>USD:</strong> US Dollar</li>
                <li>• <strong>IDR:</strong> Indonesian Rupiah</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Usage Examples:</h4>
              <ul className="space-y-1">
                <li>• <strong>USD → MYR:</strong> 1 USD = 4.7073 MYR</li>
                <li>• <strong>IDR → MYR:</strong> 1 IDR = 0.0003 MYR</li>
                <li>• <strong>MYR → USD:</strong> 1 MYR = 0.2124 USD</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Exchange rates are used for automatic currency conversion in sales calculations. 
              Make sure to update rates regularly to ensure accurate commission calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 