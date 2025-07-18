'use client';
import { useState, useEffect } from 'react';

interface Traffic {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export default function TrafficPage() {
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTraffic();
  }, []);

  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/traffic');
      const data = await response.json();
      
      if (data.success) {
        setTraffic(data.data);
      } else {
        console.error('Error fetching traffic:', data.error);
      }
    } catch (error) {
      console.error('Error fetching traffic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/traffic/${editingId}` : '/api/traffic';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData({
          name: '',
          description: ''
        });
        setEditingId(null);
        fetchTraffic();
        alert(`Traffic successfully ${editingId ? 'updated' : 'added'}!`);
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} traffic: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving traffic:', error);
      alert('An error occurred while saving traffic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Traffic) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || ''
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/traffic', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTraffic();
        alert(`Traffic successfully ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        alert('Failed to toggle traffic status: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling traffic status:', error);
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this traffic? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/traffic/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchTraffic();
          alert('Traffic successfully deleted!');
        } else {
          alert('Failed to delete traffic: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting traffic:', error);
        alert('An error occurred');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-2">
            <span className="text-lg">🚦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Manage Traffic</h1>
          <p className="text-sm text-gray-600">Add, edit, and manage traffic for tracking</p>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🚦</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Traffic' : 'Add New Traffic'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Traffic Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter traffic name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter traffic description"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Traffic' : 'Add Traffic'}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Traffic List */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Traffic List</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading traffic...</p>
                      </td>
                    </tr>
                  ) : traffic.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No traffic found. Add your first traffic source.
                      </td>
                    </tr>
                  ) : (
                    traffic.map((item, index) => (
                      <tr key={item.id || `traffic-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {item.name?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(item.id, item.is_active !== false)}
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                item.is_active !== false 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {item.is_active !== false ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
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