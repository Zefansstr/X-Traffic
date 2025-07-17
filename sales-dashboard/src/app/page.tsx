'use client';
import { useState, useEffect } from 'react';
import SalesTable from '@/components/SalesTable';
import DashboardSummary from '@/components/DashboardSummary';

// Hook untuk authentication
const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('authUser') || localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('📱 Page - User data:', parsedUser);
      console.log('📱 Page - User role:', parsedUser.role);
      setUser(parsedUser);
    } else {
      console.log('📱 Page - No user data found in localStorage');
    }
  }, []);

  return { user };
};

export default function Home() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingSale, setEditingSale] = useState<any>(null);
  
  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState('All Department');
  
  // Dropdown data - using any temporarily for complex objects
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [agentList, setAgentList] = useState<any[]>([]);
  const [trafficList, setTrafficList] = useState<any[]>([]);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [gameList, setGameList] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    amount: '',
    staff: '',
    agent: '',
    traffic: '',
    device: '',
    game: '',
    department: '',
    notes: '',
  });

  // Get available departments from department list
  const getAvailableDepartments = () => {
    return departmentList.map(dept => dept.name);
  };

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingSale(null);
    setFormData({
      customerName: '',
      phone: '',
      amount: '',
      staff: '',
      agent: '',
      traffic: '',
      device: '',
      game: '',
      department: '',
      notes: '',
    });
  };

  const handleEditSale = (sale: any) => {
    console.log('🔧 Edit sale clicked:', sale);
    setEditingSale(sale);
    setFormData({
      customerName: sale.customerName || '',
      phone: sale.phone || '',
      amount: sale.amount?.toString() || '',
      staff: sale.staffId?._id || '',
      agent: sale.agentId?._id || '',
      traffic: sale.trafficId?._id || '',
      device: sale.deviceId?._id || '',
      game: sale.gameId?._id || '',
      department: sale.type || '',
      notes: sale.notes || '',
    });
    setShowModal(true);
    setModalType('customer');
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



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Handle phone data based on user permission and mode
      let submitData;
      
      if (editingSale && !canManagePhone()) {
        // If editing and user can't manage phone, keep original phone (field was hidden)
        submitData = { ...formData, phone: editingSale.phone || '' };
        console.log('📱 Edit mode - preserving original phone for non-admin user (field was hidden)');
      } else {
        // New customer or admin/manager editing - use form data
        submitData = { ...formData };
      }
      
      console.log('Submitting form data:', submitData);
      
      const url = editingSale ? `/api/sales/${editingSale._id}` : '/api/sales';
      const method = editingSale ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);
      
      const payload = editingSale 
        ? { ...submitData, id: editingSale._id }
        : submitData;
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        handleCloseModal();
        await fetchSales();
        alert(editingSale ? 'Customer successfully updated' : 'Customer successfully added');
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
        console.error('API Error:', data);
        console.error('Full response:', response);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving data');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can view/edit phone numbers
  const canManagePhone = () => {
    console.log('🔍 =============DEBUG canManagePhone START=============');
    console.log('📱 canManagePhone - User object:', JSON.stringify(user, null, 2));
    console.log('📱 canManagePhone - User role raw:', user?.role);
    console.log('📱 canManagePhone - User role type:', typeof user?.role);
    
    if (!user || !user.role) {
      console.log('📱 canManagePhone - No user or role, returning false');
      return false;
    }
    
    // Process user role
    const userRole = String(user.role).toLowerCase().trim();
    console.log('📱 canManagePhone - User role (processed):', `"${userRole}"`);
    console.log('📱 canManagePhone - User role length:', userRole.length);
    
    // Test exact matches
    console.log('📱 canManagePhone - Is exactly "administrator"?', userRole === 'administrator');
    console.log('📱 canManagePhone - Is exactly "manager"?', userRole === 'manager');
    
    // HARDCODE TEST for administrator
    if (userRole === 'administrator') {
      console.log('✅ HARDCODE TRUE FOR ADMINISTRATOR ROLE');
      console.log('🔍 =============DEBUG canManagePhone END=============');
      return true;
    }
    
    // Check other roles
    const allowedRoles = ['administrator', 'manager'];
    const canManage = allowedRoles.includes(userRole);
    
    console.log('📱 canManagePhone - Allowed roles:', allowedRoles);
    console.log('📱 canManagePhone - Can manage phone:', canManage);
    console.log('🔍 =============DEBUG canManagePhone END=============');
    
    return canManage;
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
      
      const [staffRes, departmentRes, agentRes, trafficRes, deviceRes, gameRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/departments'),
        fetch('/api/agent'),
        fetch('/api/traffic'),
        fetch('/api/device'),
        fetch('/api/game')
      ]);

      const [staffData, departmentData, agentData, trafficData, deviceData, gameData] = await Promise.all([
        staffRes.json(),
        departmentRes.json(),
        agentRes.json(),
        trafficRes.json(),
        deviceRes.json(),
        gameRes.json()
      ]);

      console.log('Dropdown data received:', {
        staff: staffData,
        departments: departmentData,
        agents: agentData,
        traffic: trafficData,
        devices: deviceData,
        games: gameData
      });

      if (staffData.success) {
        // Filter hanya staff yang active
        const activeStaff = staffData.data.filter((staff: any) => staff.is_active !== false);
        setStaffList(activeStaff);
      }
      if (departmentData.success) {
        // Filter hanya department yang active
        const activeDepartments = departmentData.data.filter((dept: any) => dept.is_active !== false);
        setDepartmentList(activeDepartments);
      }
      if (agentData.success) {
        // Filter hanya agent yang active  
        const activeAgents = agentData.data.filter((agent: any) => agent.is_active !== false);
        setAgentList(activeAgents);
      }
      if (trafficData.success) {
        // Filter hanya traffic yang active
        const activeTraffic = trafficData.data.filter((traffic: any) => traffic.is_active !== false);
        setTrafficList(activeTraffic);
      }
      if (deviceData.success) {
        // Filter hanya device yang active
        const activeDevices = deviceData.data.filter((device: any) => device.is_active !== false);
        setDeviceList(activeDevices);
      }
      if (gameData.success) {
        // Filter hanya game yang active
        const activeGames = gameData.data.filter((game: any) => game.is_active !== false);
        setGameList(activeGames);
      }

      console.log('Updated lists:', {
        staffList: staffData.success ? staffData.data.length : 0,
        departmentList: departmentData.success ? departmentData.data.length : 0,
        agentList: agentData.success ? agentData.data.length : 0,
        trafficList: trafficData.success ? trafficData.data.length : 0,
        deviceList: deviceData.success ? deviceData.data.length : 0,
        gameList: gameData.success ? gameData.data.length : 0
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
        const sale = JSON.parse(editSaleData);
        console.log('🔧 Editing sale from member page:', sale);
        handleEditSale(sale);
        
        // Clean up
        localStorage.removeItem('editSaleData');
        window.history.replaceState({}, '', '/'); // Remove edit param from URL
      } catch (error) {
        console.error('Error parsing edit sale data:', error);
        localStorage.removeItem('editSaleData');
      }
    }

    // Add event listener for TopBar New Customer button
    const handleOpenNewCustomerModal = () => {
      handleOpenModal('customer');
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

        {/* Customer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div id="new-customer-form" className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                    {editingSale ? 'Edit Customer' : 'New Customer'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Staff Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="staff"
                    value={formData.staff}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((staff) => (
                      <option key={staff.id || staff._id} value={staff.id || staff._id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept.id || dept._id} value={dept.code}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                {/* 4. Phone Number - Only show for new customer OR admin/manager in edit mode */}
                {(!editingSale || canManagePhone()) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                )}

                {/* 5. Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                {/* 6. Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="agent"
                    value={formData.agent}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select Agent</option>
                    {agentList.map((agent) => (
                      <option key={agent.id || agent._id} value={agent.id || agent._id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Traffic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traffic
                  </label>
                  <select
                    name="traffic"
                    value={formData.traffic}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select Traffic</option>
                    {trafficList.map((traffic) => (
                      <option key={traffic.id || traffic._id} value={traffic.id || traffic._id}>
                        {traffic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. CS Device */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CS Device
                  </label>
                  <select
                    name="device"
                    value={formData.device}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select CS Device</option>
                    {deviceList.map((device) => (
                      <option key={device.id || device._id} value={device.id || device._id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Game */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="">Select Game</option>
                    {gameList.map((game) => (
                      <option key={game.id || game._id} value={game.id || game._id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 9. Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (
                      editingSale ? 'Update Customer' : 'Save Customer'
                    )}
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
