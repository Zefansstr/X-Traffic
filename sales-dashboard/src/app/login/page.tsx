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
          } catch (routerError) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md scale-90">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-slate-900/40"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`,
      }}></div>
      
      {/* Geometric patterns */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rotate-45"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/10 rotate-12"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 border border-white/10 rotate-45"></div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <div className="text-white text-3xl font-bold transform -skew-x-12">
              A
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-white text-xl font-medium tracking-wider">
            OPERATOR PORTAL
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300 text-sm text-center">
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
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              placeholder="••••••••••"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Demo Accounts Info */}
        <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <h3 className="text-white/80 text-sm font-medium mb-3">Demo Accounts:</h3>
          <div className="space-y-1 text-xs text-white/60">
            <div>Administrator: admin / admin123</div>
            <div>Manager: manager / manager123</div>
            <div>Operator: operator / operator123</div>
            <div>User: user1 / user123</div>
            <div>Viewer: viewer / viewer123</div>
          </div>
        </div>
      </div>
      </div>{/* end wrap */}
    </div>
  );
} 