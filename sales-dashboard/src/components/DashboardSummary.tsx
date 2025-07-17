'use client';

interface Sale {
  _id: string;
  staffId: string;
  customerName: string;
  amount: number;
  currency: string;
  amountInMYR: number;
  type: string;
  status: 'pending' | 'closed' | 'cancelled';
  date: string;
  notes?: string;
  isDepositor: boolean;
  isFDA: boolean;
  createdAt: string;
}

interface DashboardSummaryProps {
  sales: Sale[];
  loading: boolean;
  selectedDepartment: string;
}

export default function DashboardSummary({ sales, loading, selectedDepartment }: DashboardSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const calculateStats = () => {
    // Filter closed sales only
    let closedSales = sales.filter(sale => sale.status === 'closed');
    
    // Apply department filter
    if (selectedDepartment !== 'All Department') {
      closedSales = closedSales.filter(sale => sale.type === selectedDepartment);
    }
    
    // Total Customer - count all unique customers
    const uniqueCustomers = [...new Set(closedSales.map(sale => sale.customerName))];
    const totalCustomer = uniqueCustomers.length;
    
    // Total Depositor - count all closed transactions (deposits)
    const totalDepositor = closedSales.length;
    
    // Total Amount - sum all amounts
    const totalAmount = closedSales.reduce((sum, sale) => {
      const amount = sale.amountInMYR || sale.amount || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Average Amount per Customer
    const averageAmount = totalCustomer > 0 ? totalAmount / totalCustomer : 0;
    
    // Highest Depositor - find customer with highest single transaction
    let highestDepositor = { name: '-', amount: 0 };
    if (closedSales.length > 0) {
      const highestSale = closedSales.reduce((max, sale) => {
        const amount = sale.amountInMYR || sale.amount || 0;
        return amount > max.amount ? { name: sale.customerName, amount } : max;
      }, { name: '', amount: 0 });
      
      if (highestSale.amount > 0) {
        highestDepositor = highestSale;
      }
    }
    
    return {
      totalCustomer,
      totalDepositor,
      totalAmount,
      averageAmount,
      highestDepositor
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
      {/* Total Customer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Total Customer</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{stats.totalCustomer}</p>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Depositor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Total Depositor</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{stats.totalDepositor}</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average Amount per Customer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Average Amount</p>
            <p className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(stats.averageAmount)}</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Highest Depositor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Highest Depositor</p>
            <p className="text-base font-bold text-gray-900 mb-1 truncate">{stats.highestDepositor.name || 'N/A'}</p>
            <p className="text-xs font-semibold text-green-600">{formatCurrency(stats.highestDepositor.amount)}</p>
          </div>
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 