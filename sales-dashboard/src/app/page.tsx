'use client';
import { useState, useEffect } from 'react';
import SalesTable from '@/components/SalesTable';
import DashboardSummary from '@/components/DashboardSummary';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Remove local modal state – we will use global modal
  const [editingSale, setEditingSale] = useState<any>(null); // kept only for local logic
  
  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState('All Department');
  
  // Dropdown data - using any temporarily for complex objects
  const [departmentList, setDepartmentList] = useState<any[]>([]);

  // Get available departments from department list
  const getAvailableDepartments = () => {
    return departmentList.map(dept => dept.name);
  };

  const handleOpenModal = () => {
    console.log('🚀 Dashboard: Dispatch openNewCustomerModal');
    window.dispatchEvent(new CustomEvent('openNewCustomerModal'));
  };

  const handleEditSale = (sale: any) => {
    console.log('🔧 Edit sale clicked:', sale);
    // Simpan data ke localStorage agar dapat di-load oleh modal global
    localStorage.setItem('editSaleData', JSON.stringify(sale));
    // Buka modal
    window.dispatchEvent(new CustomEvent('openNewCustomerModal'));
  };

  const handleDeleteSale = async (saleId: string) => {
    console.log('🗑️ Delete sale clicked:', saleId);
    if (confirm('Are you sure you want to delete this sales data?')) {
      try {
        const response = await fetch(`/api/sales/${saleId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Sales successfully deleted');
          fetchSales(); // Refresh data
        } else {
          alert('Failed to delete sales');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('An error occurred while deleting sales');
      }
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      
      if (data.success) {
        setSales(data.data);
      } else {
        console.error('Error fetching sales:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      console.log('Fetching dropdown data...');
      
      const departmentRes = await fetch('/api/departments');
      const departmentData = await departmentRes.json();

      console.log('Dropdown data received:', {
        departments: departmentData,
      });

      if (departmentData.success) {
        // Filter hanya department yang active
        const activeDepartments = departmentData.data.filter((dept: any) => dept.is_active !== false);
        setDepartmentList(activeDepartments);
      }

      console.log('Updated lists:', {
        departmentList: departmentData.success ? departmentData.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchDropdownData();
    
    // Check if editing from member page
    const editSaleData = localStorage.getItem('editSaleData');
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editSaleData && editId) {
      try {
        console.log('🔧 Editing sale from member page, opening modal...');
        
        // Clean up URL
        window.history.replaceState({}, '', '/'); 
        
        // Trigger modal (localStorage data will be picked up by modal)
        window.dispatchEvent(new CustomEvent('openNewCustomerModal'));
      } catch (error) {
        console.error('Error handling edit from member page:', error);
        localStorage.removeItem('editSaleData');
      }
    }

    // Add event listener for TopBar New Customer button
    const handleOpenNewCustomerModal = () => {
      handleOpenModal();
    };

    // Add event listener for customer refresh
    const handleCustomerAdded = () => {
      fetchSales(); // Refresh the sales data
    };

    window.addEventListener('openNewCustomerModal', handleOpenNewCustomerModal);
    window.addEventListener('customerAdded', handleCustomerAdded);

    // Cleanup event listener
    return () => {
      window.removeEventListener('openNewCustomerModal', handleOpenNewCustomerModal);
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 py-3">

        {/* Department Filter Buttons */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {/* All Department Button */}
            <button
              onClick={() => setSelectedDepartment('All Department')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedDepartment === 'All Department'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Department
            </button>
            
            {/* Dynamic Department Buttons */}
            {getAvailableDepartments().map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Summary */}
        <DashboardSummary 
          sales={sales} 
          loading={loading}
          selectedDepartment={selectedDepartment}
        />

        {/* Sales Table */}
        <SalesTable 
          sales={sales} 
          loading={loading}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />

      </div>
    </div>
  );
}
