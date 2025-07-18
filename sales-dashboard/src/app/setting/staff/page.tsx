'use client';
import { useState, useEffect } from 'react';

interface Staff {
  id: string;
  name: string;
  department_id?: string;
  position: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function StaffSettingPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.data);
      } else {
        console.error('Error fetching staff:', data.error);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingId ? `/api/staff/${editingId}` : '/api/staff';
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
          position: '',
          email: '',
          phone: ''
        });
        setEditingId(null);
        fetchStaff();
        alert(`Staff ${editingId ? 'updated' : 'added'} successfully!`);
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} staff: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('An error occurred while saving staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staff: Staff) => {
    console.log('Editing staff:', staff);
    setFormData({
      name: staff.name,
      position: staff.position,
      email: staff.email || '',
      phone: staff.phone || ''
    });
    setEditingId(staff.id);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      position: '',
      email: '',
      phone: ''
    });
    setEditingId(null);
  };

  const handleDelete = async (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff?')) {
      try {
        const response = await fetch(`/api/staff/${staffId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          fetchStaff();
          alert('Staff deleted successfully!');
        } else {
          alert('Failed to delete staff: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('An error occurred while deleting staff');
      }
    }
  };

  const handleToggleActive = async (staffId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: staffId,
          is_active: !currentStatus
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchStaff();
        alert(`Staff ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Failed to update staff status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating staff status:', error);
      alert('An error occurred while updating staff status');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-2">
            <span className="text-lg">👥</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Manage Staff</h1>
          <p className="text-sm text-gray-600">Add, edit, and manage company staff</p>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Staff' : 'Add New Staff'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter staff name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                  >
                    <option value="">Select Position</option>
                    <option value="SE1">SE1 - Sales Executive Level 1</option>
                    <option value="SE2">SE2 - Sales Executive Level 2</option>
                    <option value="PE1">PE1 - Private Executive Level 1</option>
                    <option value="PE2">PE2 - Private Executive Level 2</option>
                    <option value="Manager">Manager - Sales Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Staff' : 'Add Staff'}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">Staff List</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Position</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-1 text-sm">Loading staff...</p>
                      </td>
                    </tr>
                  ) : staff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-gray-500 text-sm">
                        No staff found. Add your first staff member.
                      </td>
                    </tr>
                  ) : (
                    staff.map((member, index) => (
                      <tr key={member.id || `staff-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {member.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div className="ml-2">
                              <div className="text-xs font-medium text-gray-900">{member.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {member.position}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {member.email || '-'}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {member.phone || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(member)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(member.id, member.is_active !== false)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                member.is_active !== false 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {member.is_active !== false ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
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