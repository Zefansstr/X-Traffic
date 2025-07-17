'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'administrator' | 'manager' | 'operator' | 'user' | 'viewer';
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export default function OperatorPage() {
  const { user: currentUser, canPerformAction } = useAuth();
  
  // Debug logging
  console.log('🔍 Operator Page - Current User:', currentUser);
  console.log('🔍 Operator Page - Can Create:', canPerformAction('create'));
  console.log('🔍 Operator Page - Can Edit:', canPerformAction('edit'));
  console.log('🔍 Operator Page - Can Delete:', canPerformAction('delete'));
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'administrator' | 'manager' | 'operator' | 'user' | 'viewer',
    full_name: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        full_name: user.full_name,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        full_name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      full_name: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.full_name) {
      alert('Username, Email, dan Nama Lengkap wajib diisi');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Password wajib diisi untuk user baru');
      return;
    }

    setSubmitting(true);

    try {
      const url = '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const requestData: any = {
        ...formData,
        ...(editingUser && { id: editingUser.id }),
      };

      // Don't send empty password for updates
      if (editingUser && !formData.password) {
        delete requestData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        handleCloseModal();
        alert(`User ${editingUser ? 'berhasil diupdate' : 'berhasil dibuat'}!`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error menyimpan user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!canPerformAction('edit')) {
      alert('Anda tidak memiliki permission untuk mengubah status user');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        alert(`User successfully ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers();
      } else {
        alert('Gagal mengubah status user');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canPerformAction('delete')) {
      alert('Anda tidak memiliki permission untuk menghapus user');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus user ini? Data akan dihapus permanen.')) {
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });

        const data = await response.json();

        if (data.success) {
          alert('User berhasil dihapus permanen');
          fetchUsers();
        } else {
          alert('Error: ' + (data.error || 'Gagal menghapus user'));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Terjadi kesalahan saat menghapus user');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'operator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'operator':
        return 'Operator';
      case 'user':
        return 'User';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kelola Users</h1>
          <p className="text-gray-600">Tambah, edit, dan kelola users dengan role-based access</p>
        </div>

        {/* Form Section - Only show if user can create */}
        {canPerformAction('create') && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                      placeholder="Masukkan username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                      placeholder="Masukkan email"
                    />
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="user">User</option>
                      <option value="operator">Operator</option>
                      <option value="manager">Manager</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                    placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Menyimpan...' : (editingUser ? 'Update User' : 'Tambah User')}
                  </button>
                  
                  {editingUser && (
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Daftar Users</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Lengkap</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Login</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Belum ada data users
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 text-gray-700">{user.full_name}</td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                                                          {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Belum pernah'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {canPerformAction('edit') && (
                              <button
                                onClick={() => handleOpenModal(user)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {canPerformAction('edit') && (
                              <button
                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                className={`px-3 py-1 rounded text-xs transition-colors ${
                                  user.is_active
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            {canPerformAction('delete') && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                                                  Delete
                              </button>
                            )}
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