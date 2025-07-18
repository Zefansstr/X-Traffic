'use client';
import { useState, useEffect } from 'react';

interface Game {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GamePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/game');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        console.error('Error fetching games:', data.error);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/game/${editingId}` : '/api/game';
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
        alert(`Game berhasil ${editingId ? 'diupdate' : 'ditambahkan'}`);
        setFormData({ name: '', description: '', category: '' });
        setEditingId(null);
        fetchGames();
      } else {
        alert(`Gagal ${editingId ? 'mengupdate' : 'menambahkan'} game: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (item: Game) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus game ini?')) {
      try {
        const response = await fetch(`/api/game/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Game berhasil dihapus');
          fetchGames();
        } else {
          alert('Gagal menghapus game');
        }
      } catch (error) {
        console.error('Error deleting game:', error);
        alert('Terjadi kesalahan');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/game', {
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
        alert(`Game successfully ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchGames();
      } else {
        alert('Gagal mengubah status game');
      }
    } catch (error) {
      console.error('Error toggling game status:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', category: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-2">
            <span className="text-lg">🎮</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Kelola Game</h1>
          <p className="text-sm text-gray-600">Tambah, edit, dan kelola game yang tersedia</p>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎮</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Game' : 'Tambah Game Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Game *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-black transition-all"
                    placeholder="Masukkan nama game"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-black transition-all"
                    placeholder="Masukkan kategori game"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-black transition-all resize-none"
                  placeholder="Masukkan deskripsi game"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Menyimpan...' : (editingId ? 'Update Game' : 'Tambah Game')}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">Daftar Game</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Nama</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Kategori</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Deskripsi</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Tanggal Dibuat</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-gray-500 text-sm">
                        Memuat data...
                      </td>
                    </tr>
                  ) : games.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-gray-500 text-sm">
                        Belum ada data game
                      </td>
                    </tr>
                  ) : (
                    games.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition-colors`}>
                        <td className="px-3 py-2 font-medium text-gray-900 text-sm">{item.name}</td>
                        <td className="px-3 py-2 text-gray-700 text-sm">{item.category || '-'}</td>
                        <td className="px-3 py-2 text-gray-700 text-sm">{item.description || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-sm">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id, item.is_active)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                item.is_active 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {item.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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