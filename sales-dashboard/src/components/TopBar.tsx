'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LogoutIcon, AddUserIcon } from './Icons';

export default function TopBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Hapus localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authExpires');
      sessionStorage.clear();
      
      // Hapus cookies
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Trigger event untuk update auth state
      window.dispatchEvent(new Event('authStateChanged'));
      
      console.log('🚪 Logout completed, redirecting to login...');
      window.location.href = '/login';
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

  // Clean breadcrumb function to remove commas properly
  const getCleanTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    
    return path
      .replace(/\//g, ' ')
      .replace(/[,]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4" style={{ height: '56px' }}>
        {/* Left: Page Info */}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900">
            {getCleanTitle(pathname)}
          </h1>
        </div>

        {/* Right: New Customer + user */}
        <div className="flex items-center space-x-3">
          {/* New Customer Button - show on all pages */}
          <button
            onClick={() => {
              // Trigger global event for opening modal from any page
              window.dispatchEvent(new CustomEvent('openNewCustomerModal'));
            }}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-xs"
          >
            <AddUserIcon className="w-3 h-3 mr-2" />
            New Customer
          </button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 group hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-soft">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:block text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {user.full_name}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {user.full_name || user.username}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="px-4 py-3 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Role</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role || 'user')}`}>
                          {getRoleDisplayName(user.role || 'user')}
                        </span>
                      </div>
                      
                      {user.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Email</span>
                          <span className="text-xs text-gray-900 truncate max-w-48">
                            {user.email}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">User ID</span>
                        <span className="text-xs text-gray-900 font-mono">
                          {user.id}
                        </span>
                      </div>

                      {(user as any).created_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Member Since</span>
                          <span className="text-xs text-gray-900">
                            {new Date((user as any).created_at).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogoutIcon className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 