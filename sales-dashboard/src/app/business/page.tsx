'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface StaffBusiness {
  id: string;
  staff_name: string;
  department: string;
  position: string;
  total_user: number;
  total_depositor: number;
  total_amount: number;
  status: 'Active' | 'Inactive';
}

export default function BusinessPage() {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState<StaffBusiness[]>([]);
  const [filteredData, setFilteredData] = useState<StaffBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-18');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data berdasarkan staff yang ada dengan department terpisah
  const sampleData: StaffBusiness[] = [
    {
      id: '1',
      staff_name: 'MALIK',
      department: 'TMT',
      position: 'SE1',
      total_user: 8,
      total_depositor: 6,
      total_amount: 420.00,
      status: 'Active'
    },
    {
      id: '2',
      staff_name: 'MALIK',
      department: 'CRT',
      position: 'SE1',
      total_user: 5,
      total_depositor: 4,
      total_amount: 280.00,
      status: 'Active'
    },
    {
      id: '3',
      staff_name: 'KAREN',
      department: 'TMT',
      position: 'SE2',
      total_user: 12,
      total_depositor: 10,
      total_amount: 1250.00,
      status: 'Active'
    },
    {
      id: '4',
      staff_name: 'KAREN',
      department: 'CRT',
      position: 'SE2',
      total_user: 8,
      total_depositor: 7,
      total_amount: 980.00,
      status: 'Active'
    },
    {
      id: '5',
      staff_name: 'ADRIANSYAH',
      department: 'TMT',
      position: 'PE1',
      total_user: 15,
      total_depositor: 12,
      total_amount: 1680.00,
      status: 'Active'
    },
    {
      id: '6',
      staff_name: 'ADRIANSYAH',
      department: 'CRT',
      position: 'PE1',
      total_user: 7,
      total_depositor: 6,
      total_amount: 820.00,
      status: 'Active'
    },
    {
      id: '7',
      staff_name: 'RINTO',
      department: 'TMT',
      position: 'PE2',
      total_user: 20,
      total_depositor: 18,
      total_amount: 2450.00,
      status: 'Active'
    },
    {
      id: '8',
      staff_name: 'RINTO',
      department: 'CRT',
      position: 'PE2',
      total_user: 10,
      total_depositor: 8,
      total_amount: 1150.00,
      status: 'Active'
    },
    {
      id: '9',
      staff_name: 'FANIE',
      department: 'TMT',
      position: 'Manager',
      total_user: 25,
      total_depositor: 22,
      total_amount: 3200.00,
      status: 'Active'
    },
    {
      id: '10',
      staff_name: 'FANIE',
      department: 'CRT',
      position: 'Manager',
      total_user: 12,
      total_depositor: 10,
      total_amount: 1580.00,
      status: 'Inactive'
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setBusinessData(sampleData);
    setFilteredData(sampleData);
  }, []);

  // Filter data berdasarkan search query
  useEffect(() => {
    let filtered = businessData;

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, businessData]);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call berdasarkan date range
    setTimeout(() => {
      console.log('Searching data from', startDate, 'to', endDate);
      // Pada implementasi nyata, panggil API dengan date range
      setBusinessData(sampleData);
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setStartDate('2025-07-01');
    setEndDate('2025-07-18');
    setSearchQuery('');
    setBusinessData(sampleData);
    setFilteredData(sampleData);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, department, position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Depositor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.staff_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.total_user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{item.total_depositor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">RM {item.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing 1 to {filteredData.length} of {filteredData.length} entries
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
      </div>
    </div>
  );
} 