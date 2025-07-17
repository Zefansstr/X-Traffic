'use client'

import Link from 'next/link'

export default function ReportsPage() {
  const reports = [
    {
      title: 'Commission Report',
      description: 'Laporan komisi staff berdasarkan TMT dan CRT dengan perhitungan multi-currency',
      href: '/reports/commission',
      icon: '💰',
      color: 'bg-green-100 text-green-800 border-green-200',
      features: [
        'Perhitungan komisi TMT & CRT',
        'Multi-currency support',
        'Commission rate per position',
        'Qualified/Not Qualified status'
      ]
    },
    {
      title: 'KPI Report',
      description: 'Laporan Key Performance Indicator dengan tracking depositor dan FDA rate',
      href: '/reports/kpi',
      icon: '📊',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        'KPI Score tracking',
        'Depositor count',
        'FDA rate calculation',
        'Target achievement'
      ]
    },
    {
      title: 'Overall Report',
      description: 'Laporan keseluruhan performance dengan summary dan detail analytics',
      href: '/reports/overall',
      icon: '📈',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        'Total sales summary',
        'Staff performance analysis',
        'Exchange rates info',
        'Complete analytics'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <Link
              key={index}
              href={report.href}
              className="block group"
            >
              <div className={`bg-white rounded-lg border-2 ${report.color} p-6 transition-all duration-200 hover:shadow-lg hover:scale-105`}>
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{report.icon}</div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {report.title}
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {report.description}
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Features:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {report.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 flex items-center text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  View Report
                  <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📅 Date Range</h3>
              <p className="text-sm text-gray-600">
                Semua laporan mendukung filter berdasarkan tanggal. Pilih periode yang ingin dianalisis.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">💱 Multi-Currency</h3>
              <p className="text-sm text-gray-600">
                Sistem mendukung MYR, USD, dan IDR dengan konversi otomatis berdasarkan exchange rate.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">👥 Staff Position</h3>
              <p className="text-sm text-gray-600">
                Komisi dihitung berdasarkan position: SE1, SE2, PE1 dengan rate yang berbeda.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📊 Real-time Data</h3>
              <p className="text-sm text-gray-600">
                Semua data diupdate secara real-time berdasarkan sales yang telah diinput.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 