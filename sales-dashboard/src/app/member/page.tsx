'use client';
import { useState, useEffect, useCallback } from 'react';
import SalesTable from '@/components/SalesTable';

// Hook untuk authentication
const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return { user };
};

interface Sale {
  _id: string;
  staffId: {
    _id: string;
    name: string;
  };
  customerName: string;
  phone?: string;
  amount: number;
  agentId: {
    _id: string;
    name: string;
  };
  trafficId: {
    _id: string;
    name: string;
  };
  deviceId: {
    _id: string;
    name: string;
  };
  gameId: {
    _id: string;
    name: string;
  };
  type: string;
  status: string;
  date: string;
  notes?: string;
  createdAt: string;
}

interface Staff {
  _id: string;
  id: string;
  name: string;
  position: string;
}

export default function MemberPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    staffId: '',
    customerName: '',
    minAmount: '',
    maxAmount: '',
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      
      if (data.success) {
        setSales(data.data);
        setFilteredSales(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Check if user can view phone numbers
  const canViewPhone = () => {
    if (!user || !user.role) return false;
    return user.role === 'administrator' || user.role === 'manager';
  };

  // Edit and Delete handlers
  const handleEditSale = (sale: Sale) => {
    console.log('🔧 Edit sale clicked from member page:', sale);
    // Save edit data to localStorage and open modal directly (no redirect)
    localStorage.setItem('editSaleData', JSON.stringify(sale));
    
    // Small delay to ensure localStorage is written before modal opens
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openNewCustomerModal'));
    }, 50);
  };

  const handleDeleteSale = async (saleId: string) => {
    console.log('🗑️ Delete sale clicked:', saleId);
    if (confirm('Apakah Anda yakin ingin menghapus data sales ini?')) {
      try {
        const response = await fetch(`/api/sales/${saleId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Sales berhasil dihapus');
          fetchSales(); // Refresh data
          applyFilters(); // Reapply filters
        } else {
          alert('Gagal menghapus sales');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Terjadi kesalahan saat menghapus sales');
      }
    }
  };



  const applyFilters = useCallback(() => {
    let filtered = [...sales];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const startDate = new Date(filters.startDate);
        return saleDate >= startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const endDate = new Date(filters.endDate);
        return saleDate <= endDate;
      });
    }

    // Filter by staff
    if (filters.staffId) {
      console.log('🔍 Staff Filter Debug:');
      console.log('  Selected staffId from filter:', filters.staffId);
      console.log('  Total sales before filter:', filtered.length);
      
      filtered = filtered.filter(sale => {
        // Handle both string and object formats of staffId
        let saleStaffId;
        if (typeof sale.staffId === 'string') {
          saleStaffId = sale.staffId;
        } else if (sale.staffId && sale.staffId._id) {
          saleStaffId = sale.staffId._id;
        } else {
          saleStaffId = null;
        }
        
        const matches = saleStaffId === filters.staffId;
        if (matches) {
          console.log('  ✅ Match found:', { 
            customer: sale.customerName, 
            saleStaffId, 
            filterStaffId: filters.staffId 
          });
        }
        
        return matches;
      });
      
      console.log('  Total sales after filter:', filtered.length);
    }

    // Filter by customer name (supports multiple keywords)
    if (filters.customerName) {
      console.log('🔍 Customer Name Filter Debug:');
      console.log('  Search query:', filters.customerName);
      console.log('  Total sales before filter:', filtered.length);
      
      // Split search terms by spaces and remove empty strings
      const searchTerms = filters.customerName.toLowerCase()
        .split(' ')
        .filter(term => term.trim().length > 0);
      
      console.log('  Search terms:', searchTerms);
      
      filtered = filtered.filter(sale => {
        const customerName = sale.customerName.toLowerCase();
        
        // Check if ALL search terms are found in customer name (AND logic)
        const allTermsFound = searchTerms.every(term => 
          customerName.includes(term)
        );
        
        if (allTermsFound) {
          console.log('  ✅ Match found:', {
            customer: sale.customerName,
            searchTerms,
            matchedAll: allTermsFound
          });
        }
        
        return allTermsFound;
      });
      
      console.log('  Total sales after filter:', filtered.length);
    }

    // Filter by amount range
    if (filters.minAmount) {
      filtered = filtered.filter(sale => {
        const amount = sale.amount || 0;
        return amount >= parseFloat(filters.minAmount);
      });
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(sale => {
        const amount = sale.amount || 0;
        return amount <= parseFloat(filters.maxAmount);
      });
    }

    setFilteredSales(filtered);
  }, [sales, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      staffId: '',
      customerName: '',
      minAmount: '',
      maxAmount: '',
    });
    setFilteredSales(sales);
  };

  useEffect(() => {
    fetchSales();
    fetchStaff();
    
    // Add event listener for customer refresh after edit
    const handleCustomerUpdated = () => {
      console.log('🔄 Customer updated, refreshing member data...');
      fetchSales(); // Refresh the sales data
    };

    window.addEventListener('customerAdded', handleCustomerUpdated);

    // Cleanup event listener
    return () => {
      window.removeEventListener('customerAdded', handleCustomerUpdated);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-3 py-3">

        {/* Compact Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Filter Data</h2>
            <div className="text-xs text-gray-500">
              Showing {filteredSales.length} of {sales.length} records
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Date Range - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Staff Filter - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Staff
              </label>
              <select
                value={filters.staffId}
                onChange={(e) => handleFilterChange('staffId', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Staff</option>
                {staffList.map((staff, index) => (
                  <option key={staff.id || `staff-${index}`} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Filter - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Search customer... (multiple keywords supported)"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Amount Range - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Min Amount (MYR)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Amount (MYR)
              </label>
              <input
                type="number"
                placeholder="999999"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-3 py-1.5 text-xs rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-3 py-1.5 text-xs rounded hover:bg-gray-600 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <SalesTable 
            sales={filteredSales} 
            loading={loading} 
            onEdit={handleEditSale}
            onDelete={handleDeleteSale}
          />
        </div>
      </main>
    </div>
  );
} 