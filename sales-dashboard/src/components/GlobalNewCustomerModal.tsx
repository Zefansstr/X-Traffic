'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  editingSale?: any;
  onSuccess?: () => void;
}

export default function GlobalNewCustomerModal({ 
  isOpen: propIsOpen, 
  onClose: propOnClose, 
  editingSale, 
  onSuccess 
}: Props = {}) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown data
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

  // Use props if provided, otherwise use global events
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : showModal;

  // Update form data when editing sale changes
  useEffect(() => {
    if (editingSale && isModalOpen) {
      setFormData({
        customerName: editingSale.customerName || '',
        phone: editingSale.phone || '',
        amount: editingSale.amount?.toString() || '',
        staff: editingSale.staffId?._id || '',
        agent: editingSale.agentId?._id || '',
        traffic: editingSale.trafficId?._id || '',
        device: editingSale.deviceId?._id || '',
        game: editingSale.gameId?._id || '',
        department: editingSale.type || '',
        notes: editingSale.notes || '',
      });
    }
  }, [editingSale, isModalOpen]);

  // Listen for global event to open modal (only when no props provided)
  useEffect(() => {
    if (propIsOpen === undefined) {
      const handleOpenModal = () => {
        setShowModal(true);
        fetchDropdownData(); // Load fresh data when modal opens
      };

      window.addEventListener('openNewCustomerModal', handleOpenModal);
      
      return () => {
        window.removeEventListener('openNewCustomerModal', handleOpenModal);
      };
    }
  }, [propIsOpen]);

  // Load dropdown data when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchDropdownData();
    }
  }, [isModalOpen]);

  // Check if user can view/edit phone numbers
  const canManagePhone = () => {
    if (!user || !user.role) {
      return false;
    }
    
    const userRole = String(user.role).toLowerCase().trim();
    const allowedRoles = ['administrator', 'manager'];
    return allowedRoles.includes(userRole);
  };

  const fetchDropdownData = async () => {
    try {
      const [staffData, departmentData, agentData, trafficData, deviceData, gameData] = await Promise.all([
        fetch('/api/staff').then(res => res.json()),
        fetch('/api/departments').then(res => res.json()),
        fetch('/api/agent').then(res => res.json()),
        fetch('/api/traffic').then(res => res.json()),
        fetch('/api/device').then(res => res.json()),
        fetch('/api/game').then(res => res.json())
      ]);

      if (staffData.success) {
        const activeStaff = staffData.data.filter((staff: any) => staff.is_active !== false);
        setStaffList(activeStaff);
      }
      if (departmentData.success) {
        const activeDepartments = departmentData.data.filter((dept: any) => dept.is_active !== false);
        setDepartmentList(activeDepartments);
      }
      if (agentData.success) {
        const activeAgents = agentData.data.filter((agent: any) => agent.is_active !== false);
        setAgentList(activeAgents);
      }
      if (trafficData.success) {
        const activeTraffic = trafficData.data.filter((traffic: any) => traffic.is_active !== false);
        setTrafficList(activeTraffic);
      }
      if (deviceData.success) {
        const activeDevices = deviceData.data.filter((device: any) => device.is_active !== false);
        setDeviceList(activeDevices);
      }
      if (gameData.success) {
        const activeGames = gameData.data.filter((game: any) => game.is_active !== false);
        setGameList(activeGames);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleCloseModal = () => {
    console.log('🔄 handleCloseModal called...');
    console.log('🔍 propOnClose:', propOnClose ? 'exists' : 'undefined');
    console.log('🔍 propIsOpen:', propIsOpen);
    
    // Clear form data first
    console.log('🧹 Clearing form data...');
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
    
    // Close modal immediately - no delay
    if (propOnClose) {
      console.log('📞 Calling propOnClose() immediately...');
      propOnClose();
      console.log('✅ propOnClose() called');
    } else {
      console.log('📝 Setting showModal to false');
      setShowModal(false);
    }
    
    console.log('✅ handleCloseModal completed');
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
      } else {
        // New customer or admin/manager editing - use form data
        submitData = { ...formData };
      }
      
      console.log('Submitting form data:', submitData);
      
      const url = editingSale ? `/api/sales/${editingSale._id}` : '/api/sales';
      const method = editingSale ? 'PUT' : 'POST';
      
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Customer saved successfully, closing modal...');
        
        // Reset submitting state first
        setSubmitting(false);
        
        // Clear form data
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
        
        // Close modal - direct approach for dashboard
        if (propOnClose) {
          console.log('📞 Dashboard: Calling propOnClose()...');
          propOnClose();
        } else {
          console.log('📝 Global: Setting showModal to false');
          setShowModal(false);
        }
        
        // Call success callbacks
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.dispatchEvent(new CustomEvent('customerAdded'));
          }
        }, 50);
        
        console.log('✅ Modal closing process completed');
        return; // Exit early to avoid setSubmitting in finally block
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving data');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200/50 p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
              {editingSale ? 'Edit Customer' : 'New Customer'}
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Staff Name + Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Staff Name <span className="text-red-500">*</span>
              </label>
              <select
                name="staff"
                value={formData.staff}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Staff</option>
                {staffList.map((staff) => (
                  <option key={staff.id || staff._id} value={staff.id || staff._id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Department</option>
                {departmentList.map((dept) => (
                  <option key={dept.id || dept._id} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Customer Name + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              />
            </div>

            {/* Phone Number - Only show for new customer OR admin/manager in edit mode */}
            {(!editingSale || canManagePhone()) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                  placeholder="Enter phone number"
                />
              </div>
            )}
          </div>

          {/* Row 3: Amount (full width, emphasized) */}
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm font-medium"
            />
          </div>

          {/* Row 4: Agent + Traffic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Agent <span className="text-red-500">*</span>
              </label>
              <select
                name="agent"
                value={formData.agent}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Agent</option>
                {agentList.map((agent) => (
                  <option key={agent.id || agent._id} value={agent.id || agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Traffic
              </label>
              <select
                name="traffic"
                value={formData.traffic}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Traffic</option>
                {trafficList.map((traffic) => (
                  <option key={traffic.id || traffic._id} value={traffic.id || traffic._id}>
                    {traffic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Device + Game */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Device
              </label>
              <select
                name="device"
                value={formData.device}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Device</option>
                {deviceList.map((device) => (
                  <option key={device.id || device._id} value={device.id || device._id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Game
              </label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              >
                <option value="">Select Game</option>
                {gameList.map((game) => (
                  <option key={game.id || game._id} value={game.id || game._id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Notes (full width) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              placeholder="Additional notes (optional)"
            />
          </div>

          {/* Button Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
              >
                {submitting ? 'Saving...' : (
                  editingSale ? 'Update Customer' : 'Save Customer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 