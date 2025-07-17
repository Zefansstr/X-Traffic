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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/20 rotate-45 rounded-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 border border-white/20 rotate-12 rounded-3xl"></div>
        <div className="absolute top-3/4 left-1/6 w-48 h-48 border border-white/20 rotate-45 rounded-3xl"></div>
      </div>

      {/* Main Content - Scale diperkecil */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-6 scale-90">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          {/* Logo - diperkecil */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mb-6 shadow-2xl">
            <div className="text-white text-2xl font-bold">
              X
            </div>
          </div>
          
          {/* Title - diubah ke X-Traffic */}
          <h1 className="text-white text-lg font-medium tracking-wider">
            X-Traffic
          </h1>
        </div>

        {/* Login Form - diperkecil */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Username"
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
      </div>
    </div>
  );
} 