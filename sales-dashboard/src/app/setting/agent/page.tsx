'use client';
import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agent');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data);
      } else {
        console.error('Error fetching agents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/agent/${editingId}` : '/api/agent';
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
        alert(`Agent ${editingId ? 'updated' : 'added'} successfully!`);
        setFormData({ name: '', description: '' });
        setEditingId(null);
        fetchAgents();
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} agent: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setFormData({
      name: agent.name,
      description: agent.description || ''
    });
    setEditingId(agent.id);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/agent', {
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
        fetchAgents();
        alert(`Agent successfully ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        alert('Failed to change agent status: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      alert('An error occurred');
    }
  };

  const handleDelete = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await fetch(`/api/agent/${agentId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAgents();
          alert('Agent deleted successfully!');
        } else {
          alert('Failed to delete agent');
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('An error occurred while deleting agent');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Agent</h1>
          <p className="text-gray-600">Add, edit, and manage agents for the system</p>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Agent' : 'Add New Agent'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter agent name"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black transition-all"
                    placeholder="Enter agent description"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Agent' : 'Add Agent'}
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

        {/* Agent List */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Agent List</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading agents...</p>
                      </td>
                    </tr>
                  ) : agents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No agents found. Add your first agent.
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent, index) => (
                      <tr key={agent.id || `agent-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {agent.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agent.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {agent.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(agent)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(agent.id, agent.is_active !== false)}
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                agent.is_active !== false 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {agent.is_active !== false ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(agent.id)}
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