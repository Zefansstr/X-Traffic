'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🚀 Starting login process...');
    console.log('📝 Form data:', { username: formData.username, password: '***' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Login response data:', data);

      if (data.success && data.data) {
        console.log('✅ Login successful!');
        
        // Store auth data in localStorage AND cookies
        try {
          // Set localStorage
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('authUser', JSON.stringify(data.data.user));
          localStorage.setItem('authExpires', data.data.expires_at);
          
          // Set cookies untuk middleware
          document.cookie = `authToken=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `authUser=${JSON.stringify(data.data.user)}; path=/; max-age=86400; SameSite=Lax`;
          
          console.log('💾 Auth data stored in localStorage and cookies');
          console.log('👤 User data:', data.data.user);
          
          // Trigger custom event untuk memberitahu component lain bahwa auth state berubah
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Small delay to ensure storage is set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirect to dashboard with window.location as fallback
          console.log('🚀 Redirecting to dashboard...');
          
          try {
            router.push('/');
          } catch {
            console.log('⚠️ Router.push failed, using window.location');
            window.location.href = '/';
          }
          
        } catch (storageError) {
          console.error('❌ LocalStorage error:', storageError);
          setError('Error menyimpan data login');
        }
      } else {
        console.log('❌ Login failed:', data);
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('❌ Login request error:', error);
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">X</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">X-Traffic</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Accounts:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Administrator:</span>
                <span className="font-mono">admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Manager:</span>
                <span className="font-mono">manager / manager123</span>
              </div>
              <div className="flex justify-between">
                <span>Operator:</span>
                <span className="font-mono">operator / operator123</span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span className="font-mono">user1 / user123</span>
              </div>
              <div className="flex justify-between">
                <span>Viewer:</span>
                <span className="font-mono">viewer / viewer123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 