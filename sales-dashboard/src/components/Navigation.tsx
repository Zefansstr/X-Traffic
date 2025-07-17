'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { canUserAccessMenu, type User } from '../lib/models/User';
import { useAuth } from '../lib/hooks/useAuth';
import { 
  DashboardIcon, 
  MemberIcon, 
  OverallReportIcon, 
  CommissionReportIcon, 
  SettingIcon, 
  OperatorIcon,
  LogoutIcon,
  LoginIcon 
} from './Icons';

export default function Navigation() {
  const pathname = usePathname();
  const { user: currentUser, loading, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading state untuk mencegah flash content
  if (loading) {
    return (
      <div className="fixed inset-y-0 left-0 flex flex-col bg-white shadow-xl border-r border-gray-200 w-64 z-50">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Notify ClientLayout when sidebar state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarToggled'));
  }, [isCollapsed]);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: <DashboardIcon className="w-5 h-5" />, 
      menuKey: 'dashboard' as const
    },
    { 
      name: 'Member', 
      href: '/member', 
      icon: <MemberIcon className="w-5 h-5" />, 
      menuKey: 'member' as const
    },
    { 
      name: 'Overall Report', 
      href: '/reports/overall', 
      icon: <OverallReportIcon className="w-5 h-5" />, 
      menuKey: 'reports' as const
    },
    { 
      name: 'Commission Report', 
      href: '/reports/commission', 
      icon: <CommissionReportIcon className="w-5 h-5" />, 
      menuKey: 'commission' as const
    },
    { 
      name: 'Setting', 
      href: '/setting', 
      icon: <SettingIcon className="w-5 h-5" />, 
      menuKey: 'setting' as const
    },
    { 
      name: 'Operator', 
      href: '/setting/operator', 
      icon: <OperatorIcon className="w-5 h-5" />, 
      menuKey: 'operator' as const
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    // Fix untuk setting/operator - operator tidak boleh membuat setting aktif
    if (href === '/setting' && pathname.startsWith('/setting/operator')) {
      return false;
    }
    return pathname.startsWith(href);
  };

  const canAccess = (menuKey: string) => {
    // Jika belum login, jangan tampilkan menu yang memerlukan authentication
    if (!currentUser || !currentUser.role) {
      console.log('🚫 No user logged in');
      return false; // Jangan tampilkan menu apapun jika belum login
    }
    
    console.log('🔍 Checking access for:', { user: currentUser, menuKey });
    
    try {
      const hasAccess = canUserAccessMenu(currentUser.role, menuKey as any);
      console.log(`🔍 Menu access check - User: ${currentUser.role}, Menu: ${menuKey}, Access: ${hasAccess}`);
      return hasAccess;
    } catch (error) {
      console.error('🚨 Error checking menu access:', error);
      return false; // Jangan beri akses jika ada error
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

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  };

  const sidebarLinkClass = (pathname: string, href: string) =>
    `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
      pathname === href
        ? 'bg-white/10 text-white'
        : 'text-white/80 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className={`fixed inset-y-0 left-0 flex flex-col bg-white shadow-xl border-r border-gray-200 overflow-hidden z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo & Title with Toggle - Always visible */}
      <div className="flex items-center justify-between border-b border-gray-200" style={{ height: '56px' }}>
        <div className={`flex items-center space-x-2 ${isCollapsed ? 'pl-2' : 'pl-4'}`}>
          {/* Logo with just X - Always visible */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
            <span className="text-base font-extrabold -skew-x-12 text-white">X</span>
          </div>
          {/* Text Traffic - Only show when expanded */}
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-wide text-gray-900">Traffic</span>
          )}
        </div>
        
        {/* Toggle Button - Clean design without shadow */}
        <div className={isCollapsed ? 'pr-2' : 'pr-4'}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-gray-900 ${
              isCollapsed 
                ? 'w-10 h-8 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200' 
                : 'h-full px-3 hover:bg-gray-100'
            }`}
            title={isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            <svg
              className={`transition-transform ${isCollapsed ? 'w-4 h-4 rotate-180' : 'w-4 h-4'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu - Always show, but icons only when collapsed */}
      <nav className="flex-1 mt-4 px-2">
        {!isClient ? (
          // Loading state
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            {!isCollapsed && <p className="text-sm text-gray-600 mt-2">Loading...</p>}
          </div>
        ) : (
          currentUser ? (
            // Jika sudah login, tampilkan menu berdasarkan role
            (() => {
              console.log('🎯 Current user exists:', currentUser);
              const filteredNavigation = navigation.filter(item => canAccess(item.menuKey));
              console.log('🎯 Filtered navigation:', filteredNavigation);
              
              if (filteredNavigation.length === 0) {
                return !isCollapsed ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-sm">
                      🚨 No menu items accessible for role: {currentUser.role}
                    </div>
                  </div>
                ) : null;
              }
              
              return filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center mb-1 text-sm font-medium rounded-lg transition-colors ${
                    isCollapsed 
                      ? 'px-3 py-3 justify-center' 
                      : 'px-3 py-3'
                  } ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                  {!isCollapsed && item.name}
                </Link>
              ));
            })()
          ) : (
            // Jika belum login, tampilkan pesan dan link ke login
            <div className="text-center py-8">
              {!isCollapsed ? (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <LoginIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Not Logged In</h3>
                    <p className="text-sm text-gray-600 mb-4">Please login to access dashboard</p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span className="mr-2">
                      <LoginIcon className="w-5 h-5" />
                    </span>
                    Login Now
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Login"
                >
                  <LoginIcon className="w-5 h-5" />
                </Link>
              )}
            </div>
          )
        )}
      </nav>

      {/* Auth Action - Show logout icon when collapsed */}
      <div className="mt-auto p-4 border-t border-gray-200">
        {currentUser ? (
          <button
            onClick={handleLogout}
            className={`flex items-center w-full text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
              isCollapsed 
                ? 'px-3 py-3 justify-center' 
                : 'px-4 py-3'
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>
              <LogoutIcon className="w-5 h-5" />
            </span>
            {!isCollapsed && 'Logout'}
          </button>
        ) : (
          <Link
            href="/login"
            className={`flex items-center w-full text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-colors ${
              isCollapsed 
                ? 'px-3 py-3 justify-center' 
                : 'px-4 py-3'
            }`}
            title={isCollapsed ? 'Login' : ''}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>
              <LoginIcon className="w-5 h-5" />
            </span>
            {!isCollapsed && 'Login'}
          </Link>
        )}
      </div>
    </div>
  );
} 