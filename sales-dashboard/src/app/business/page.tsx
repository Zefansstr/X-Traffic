'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface BusinessTraffic {
  id: string;
  name: string;
  traffic_sources: string;
  description: string;
  members: number;
  transactions: number;
  transaction_profit: number;
  active_members: number;
  gross_profit: number;
  started_at: string;
  status: 'Active' | 'Inactive';
}

export default function BusinessPage() {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState<BusinessTraffic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [fromDate, setFromDate] = useState('2025-07-01');
  const [toDate, setToDate] = useState('2025-07-16');
  const [trafficSource, setTrafficSource] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Form data for adding new traffic
  const [formData, setFormData] = useState({
    name: '',
    traffic_sources: '',
    description: '',
    status: 'Active'
  });

  // Sample data (replace with actual API calls)
  const sampleData: BusinessTraffic[] = [
    {
      id: '1',
      name: 'RINTO',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROFESSIONAL',
      members: 71,
      transactions: 68,
      transaction_profit: 2855.00,
      active_members: 68,
      gross_profit: 2855.00,
      started_at: '2023-12-05 12:37:35',
      status: 'Active'
    },
    {
      id: '2',
      name: 'ADRIANSYAH',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROFESSIONAL',
      members: 56,
      transactions: 53,
      transaction_profit: 2564.00,
      active_members: 53,
      gross_profit: 2564.00,
      started_at: '2023-03-28 00:15:22',
      status: 'Active'
    },
    {
      id: '3',
      name: 'KAREN',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'SENIOR',
      members: 37,
      transactions: 37,
      transaction_profit: 2259.50,
      active_members: 37,
      gross_profit: 2259.50,
      started_at: '2023-12-05 12:39:20',
      status: 'Active'
    },
    {
      id: '4',
      name: 'MALIK',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'JUNIOR',
      members: 37,
      transactions: 37,
      transaction_profit: 1760.00,
      active_members: 37,
      gross_profit: 1760.00,
      started_at: '2024-05-29 10:33:31',
      status: 'Active'
    },
    {
      id: '5',
      name: 'FANIE',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROBATION',
      members: 40,
      transactions: 39,
      transaction_profit: 1690.00,
      active_members: 39,
      gross_profit: 1690.00,
      started_at: '2025-05-14 12:20:38',
      status: 'Active'
    },
    {
      id: '6',
      name: 'CRT KAREN',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'SENIOR',
      members: 26,
      transactions: 26,
      transaction_profit: 1320.00,
      active_members: 26,
      gross_profit: 1320.00,
      started_at: '2023-12-05 15:44:43',
      status: 'Active'
    },
    {
      id: '7',
      name: 'CRT ADRIANSYAH',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROFESSIONAL',
      members: 28,
      transactions: 26,
      transaction_profit: 910.00,
      active_members: 26,
      gross_profit: 910.00,
      started_at: '2025-07-03 15:43:42',
      status: 'Active'
    },
    {
      id: '8',
      name: 'CRT MALIK',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'SENIOR',
      members: 20,
      transactions: 20,
      transaction_profit: 875.00,
      active_members: 20,
      gross_profit: 875.00,
      started_at: '2024-05-29 15:45:05',
      status: 'Active'
    },
    {
      id: '9',
      name: 'CRT RINTO',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROFESSIONAL',
      members: 18,
      transactions: 18,
      transaction_profit: 800.00,
      active_members: 18,
      gross_profit: 800.00,
      started_at: '2023-12-05 15:44:19',
      status: 'Active'
    },
    {
      id: '10',
      name: 'CRT FANIE',
      traffic_sources: 'TMT DEPARTMENT',
      description: 'PROBATION',
      members: 8,
      transactions: 8,
      transaction_profit: 250.00,
      active_members: 8,
      gross_profit: 250.00,
      started_at: '2025-05-14 15:45:40',
      status: 'Active'
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setBusinessData(sampleData);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBusinessData(sampleData);
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setFromDate('2025-07-01');
    setToDate('2025-07-16');
    setTrafficSource('');
    setStatus('Active');
    setBusinessData(sampleData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add new traffic logic here
    console.log('Adding new traffic:', formData);
    setShowModal(false);
    setFormData({
      name: '',
      traffic_sources: '',
      description: '',
      status: 'Active'
    });
  };

  const handleEdit = (id: string) => {
    console.log('Edit traffic:', id);
  };

  const handleView = (id: string) => {
    console.log('View traffic:', id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this traffic?')) {
      setBusinessData(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Business</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Traffic Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Traffic Source</label>
              <select
                value={trafficSource}
                onChange={(e) => setTrafficSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Please Select</option>
                <option value="TMT DEPARTMENT">TMT DEPARTMENT</option>
                <option value="CRT DEPARTMENT">CRT DEPARTMENT</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="mr-2">+</span>
                Add Traffic
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic Sources</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businessData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.traffic_sources}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.members}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transactions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">▲ {item.transaction_profit.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.active_members}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">▲ {item.gross_profit.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.started_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(item.id)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 002 0V9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing 1 to 10 of 10 entries
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Traffic Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Traffic</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Sources</label>
                  <select
                    value={formData.traffic_sources}
                    onChange={(e) => setFormData(prev => ({ ...prev, traffic_sources: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Traffic Source</option>
                    <option value="TMT DEPARTMENT">TMT DEPARTMENT</option>
                    <option value="CRT DEPARTMENT">CRT DEPARTMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <select
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="PROBATION">PROBATION</option>
                    <option value="JUNIOR">JUNIOR</option>
                    <option value="SENIOR">SENIOR</option>
                    <option value="PROFESSIONAL">PROFESSIONAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add Traffic
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 