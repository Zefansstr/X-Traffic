'use client';
import { useState, useEffect } from 'react';

export default function GlobalNewCustomerModal() {
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

  // Listen for global event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      setShowModal(true);
      fetchDropdownData(); // Load fresh data when modal opens
    };

    window.addEventListener('openNewCustomerModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openNewCustomerModal', handleOpenModal);
    };
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [staffData, departmentData, agentData, trafficData, deviceData, gameData] = await Promise.all([
        fetch('/api/staff').then(res => res.json()),
        fetch('/api/departments').then(res => res.json()),
        fetch('/api/agent').then(res => res.json()),
        fetch('/api/traffic').then(res => res.json()),
        fetch('/api/device').then(res => res.json()),
        fetch('/api/game').then(res => res.json()),
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
    setShowModal(false);
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
      console.log('Submitting form data:', formData);
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        handleCloseModal();
        alert('Customer successfully added');
        // Trigger refresh event for any listening components
        window.dispatchEvent(new CustomEvent('customerAdded'));
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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
              New Customer
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
          {/* Staff Name */}
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

          {/* Department */}
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

          {/* Customer Name */}
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

          {/* Phone Number */}
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
              placeholder="Enter phone number"
            />
          </div>

          {/* Amount */}
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
              placeholder="0.00"
            />
          </div>

          {/* Agent */}
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

          {/* Traffic */}
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

          {/* Device */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device
            </label>
            <select
              name="device"
              value={formData.device}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">Select Device</option>
              {deviceList.map((device) => (
                <option key={device.id || device._id} value={device.id || device._id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game */}
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

          {/* Notes */}
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
              placeholder="Additional notes (optional)"
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
              {submitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 