'use client';
import { useState, useEffect } from 'react';

interface Device {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DevicePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/device');
      if (response.ok) {
        const data = await response.json();
        // Handle both direct array and success format
        if (Array.isArray(data)) {
          setDevices(data);
        } else if (data.success && Array.isArray(data.data)) {
          setDevices(data.data);
        } else {
          setDevices([]);
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/device/${editingId}` : '/api/device';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        fetchDevices();
        alert(`Device successfully ${editingId ? 'updated' : 'added'}!`);
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} device`);
      }
    } catch (error) {
      console.error('Error saving device:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Device) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/device/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchDevices();
          alert('Device successfully deleted!');
        } else {
          alert('Failed to delete device');
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Terjadi kesalahan');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/device', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        alert(`Device successfully ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchDevices();
      } else {
        alert('Failed to change device status');
      }
    } catch (error) {
      console.error('Error toggling device status:', error);
      alert('An error occurred');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Device</h1>
          <p className="text-gray-600">Add, edit, and manage devices for tracking</p>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Device' : 'Add New Device'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter device name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter device description"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Device' : 'Add Device')}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Device List</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-100 to-orange-100">
                                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading devices...
                      </td>
                    </tr>
                  ) : devices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No devices found. Add your first device.
                      </td>
                    </tr>
                  ) : (
                    devices.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50 transition-colors`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-700">{item.description || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id, item.is_active)}
                              className={`px-3 py-1 rounded-md transition-colors text-sm ${
                                item.is_active 
                                  ? 'bg-red-500 text-white hover:bg-red-600' 
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {item.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 