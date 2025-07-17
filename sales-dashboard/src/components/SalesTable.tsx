'use client';
import { useState, useEffect } from 'react';

// Hook untuk authentication (assuming it exists)
const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('authUser') || localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('📱 SalesTable - User data:', parsedUser);
      console.log('📱 SalesTable - User role:', parsedUser.role);
      setUser(parsedUser);
    } else {
      console.log('📱 SalesTable - No user data found in localStorage');
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

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  onEdit?: (sale: Sale) => void;
  onDelete?: (saleId: string) => void;
}

type SortDirection = 'asc' | 'desc' | '';
type SortColumn = 'type' | 'staff' | 'customer' | 'phone' | 'amount' | 'agent' | 'traffic' | 'device' | 'game' | 'notes' | 'date';

interface SortConfig {
  column: SortColumn | '';
  direction: SortDirection;
}

export default function SalesTable({ sales, loading, onEdit, onDelete }: SalesTableProps) {
  const { user } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Sorting state
  const [sortedSales, setSortedSales] = useState<Sale[]>(sales);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: '',
    direction: ''
  });
  
  // Calculate pagination
  const totalItems = sortedSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sortedSales.slice(startIndex, endIndex);
  
  // Update sorted sales when sales prop changes
  useEffect(() => {
    setSortedSales(sales);
    setCurrentPage(1);
  }, [sales]);

  // Check if user can view/edit phone numbers
  const canManagePhone = () => {
    console.log('🔍 =============DEBUG canManagePhone START=============');
    console.log('📱 canManagePhone - User object:', JSON.stringify(user, null, 2));
    console.log('📱 canManagePhone - User role raw:', user?.role);
    console.log('📱 canManagePhone - User role type:', typeof user?.role);

    if (!user || !user.role) {
      console.log('📱 canManagePhone - No user or role found, returning false');
      return false;
    }

    const allowedRoles = ['administrator', 'manager'];
    const canManage = allowedRoles.includes(user.role.toLowerCase());
    
    console.log('📱 canManagePhone - Allowed roles:', allowedRoles);
    console.log('📱 canManagePhone - User role (lowercase):', user.role.toLowerCase());
    console.log('📱 canManagePhone - Can manage phone:', canManage);
    console.log('🔍 =============DEBUG canManagePhone END=============');
    
    return canManage;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Sorting function
  const sortData = (column: SortColumn, direction: SortDirection) => {
    if (!direction) {
      setSortedSales([...sales]);
      return;
    }

    const sorted = [...sales].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (column) {
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'staff':
          aValue = a.staffId?.name || '';
          bValue = b.staffId?.name || '';
          break;
        case 'customer':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'agent':
          aValue = a.agentId?.name || '';
          bValue = b.agentId?.name || '';
          break;
        case 'traffic':
          aValue = a.trafficId?.name || '';
          bValue = b.trafficId?.name || '';
          break;
        case 'device':
          aValue = a.deviceId?.name || '';
          bValue = b.deviceId?.name || '';
          break;
        case 'game':
          aValue = a.gameId?.name || '';
          bValue = b.gameId?.name || '';
          break;
        case 'notes':
          aValue = a.notes || '';
          bValue = b.notes || '';
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      // Handle different data types
      if (column === 'amount') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (column === 'date') {
        return direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      } else {
        // String comparison
        const compareResult = aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
        return direction === 'asc' ? compareResult : -compareResult;
      }
    });

    setSortedSales(sorted);
  };

  // Handle sort change
  const handleSort = (column: SortColumn) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.column === column) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = '';
      } else {
        direction = 'asc';
      }
    }

    setSortConfig({ column: direction ? column : '', direction });
    sortData(column, direction);
  };

  // Reset sort
  const resetSort = () => {
    setSortConfig({ column: '', direction: '' });
    setSortedSales([...sales]);
  };

  // Apply sort when sales change
  useEffect(() => {
    if (sortConfig.column && sortConfig.direction) {
      sortData(sortConfig.column, sortConfig.direction);
    } else {
      setSortedSales([...sales]);
    }
  }, [sales]);

  // Initialize sorted sales
  useEffect(() => {
    setSortedSales([...sales]);
  }, [sales]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const handleEdit = (sale: Sale) => {
    if (onEdit) {
      onEdit(sale);
    }
  };

  const handleDelete = (saleId: string) => {
    if (onDelete) {
      // Confirmation dialog
      if (confirm('Apakah Anda yakin ingin menghapus data sales ini?')) {
        onDelete(saleId);
      }
    }
  };

  // Sort icon component
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortConfig.column !== column) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l9 16 9-16H3z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20L12 4 3 20h18z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Sort Controls - Compact */}
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-800">
          Total {sortedSales.length} data sales
          {sortConfig.column && (
            <span className="ml-2 text-xs text-gray-500">
              (Diurutkan berdasarkan {sortConfig.column} {sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
            </span>
          )}
        </h3>
        <button
          onClick={resetSort}
          className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors font-medium"
        >
          Reset Urutan
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Belum ada data sales. Silakan tambahkan data pertama Anda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    <SortIcon column="type" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('staff')}
                >
                  <div className="flex items-center">
                    Staff
                    <SortIcon column="staff" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    <SortIcon column="customer" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={canManagePhone() ? () => handleSort('phone') : undefined}
                  style={canManagePhone() ? {} : {cursor: 'default'}}
                >
                  <div className="flex items-center">
                  Phone
                    {canManagePhone() && <SortIcon column="phone" />}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                  Amount
                    <SortIcon column="amount" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('agent')}
                >
                  <div className="flex items-center">
                  Agent
                    <SortIcon column="agent" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('traffic')}
                >
                  <div className="flex items-center">
                  Traffic
                    <SortIcon column="traffic" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('device')}
                >
                  <div className="flex items-center">
                  Device
                    <SortIcon column="device" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('game')}
                >
                  <div className="flex items-center">
                    Game
                    <SortIcon column="game" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center">
                    Note
                    <SortIcon column="notes" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon column="date" />
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSales.map((sale, index) => (
                <tr key={sale._id || `sale-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sale.type === 'TMT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {sale.staffId?.name || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sale.customerName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {canManagePhone() ? (sale.phone || '-') : '*****'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sale.agentId?.name || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sale.trafficId?.name || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sale.deviceId?.name || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sale.gameId?.name || '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={sale.notes || '-'}>
                    {sale.notes || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(sale._id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          {/* Left: Items per page and info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </select>
              <span className="text-xs text-gray-700">entries</span>
            </div>
            
            <div className="text-xs text-gray-700">
              Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems}
            </div>
          </div>

          {/* Right: Page navigation */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Previous page"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                  disabled={page === '...'}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Next page"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 