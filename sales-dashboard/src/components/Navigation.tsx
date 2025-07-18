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

  // All useEffect hooks must be called in the same order every render
  useEffect(() => {
    setIsClient(true);
    
    // Load sidebar state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      const collapsed = JSON.parse(savedCollapsedState);
      setIsCollapsed(collapsed);
      console.log('🔧 Navigation: Loaded sidebar state from localStorage:', collapsed);
    }
  }, []);

  // Notify ClientLayout when sidebar state changes and save to localStorage
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    
    // Notify ClientLayout
    window.dispatchEvent(new CustomEvent('sidebarToggled', { 
      detail: { isCollapsed } 
    }));
    
    console.log('🔧 Navigation: Sidebar state changed to:', isCollapsed);
  }, [isCollapsed]);

  // DEBUG: Log user data when it changes
  useEffect(() => {
    if (currentUser) {
      console.log('🐛 =============== NAVIGATION DEBUG START ===============');
      console.log('🔍 Current User Object:', JSON.stringify(currentUser, null, 2));
      console.log('🔍 User Role (raw):', currentUser.role);
      console.log('🔍 User Role Type:', typeof currentUser.role);
      console.log('🔍 User Full Name:', currentUser.full_name);
      console.log('🔍 User Username:', currentUser.username);
      console.log('🐛 =============== NAVIGATION DEBUG END ===============');
    }
  }, [currentUser]);

  // Define navigation array - same every render
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

  // Helper functions - no hooks in these
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    if (href === '/setting' && pathname.startsWith('/setting/operator')) {
      return false;
    }
    return pathname.startsWith(href);
  };

  const canAccess = (menuKey: string) => {
    console.log('🔍 ============= canAccess DEBUG START =============');
    console.log('🔍 Checking access for menu:', menuKey);
    console.log('🔍 Current user exists:', !!currentUser);
    
    if (!currentUser || !currentUser.role) {
      console.log('🚫 No user or role, denying access');
      console.log('🔍 ============= canAccess DEBUG END =============');
      return false;
    }
    
    console.log('🔍 User role for menu check:', currentUser.role);
    console.log('🔍 Menu key:', menuKey);
    
    try {
      const hasAccess = canUserAccessMenu(currentUser.role, menuKey as any);
      console.log('🔍 Menu access result:', hasAccess);
      console.log('🔍 ============= canAccess DEBUG END =============');
      return hasAccess;
    } catch (error) {
      console.error('🚨 Error checking menu access:', error);
      console.log('🔍 ============= canAccess DEBUG END =============');
      return false;
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  };

  // Loading state - early return after all hooks
  if (loading) {
    return (
      <div className="fixed inset-y-0 left-0 flex flex-col bg-white shadow-xl border-r border-gray-200 w-64 z-50">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-y-0 left-0 flex flex-col bg-white shadow-xl border-r border-gray-200 overflow-hidden z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo & Title with Toggle */}
      <div className="flex items-center justify-between border-b border-gray-200" style={{ height: '56px' }}>
        <div className={`flex items-center space-x-2 ${isCollapsed ? 'pl-2' : 'pl-4'}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
            <span className="text-base font-extrabold -skew-x-12 text-white">X</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-wide text-gray-900">Traffic</span>
          )}
        </div>
        
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

      {/* Navigation Menu */}
      <nav className="flex-1 mt-4 px-2">
        {!isClient ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            {!isCollapsed && <p className="text-sm text-gray-600 mt-2">Loading...</p>}
          </div>
        ) : currentUser ? (
          (() => {
            console.log('🎯 ========== MENU FILTERING DEBUG START ==========');
            console.log('🎯 Available navigation items:', navigation.map(item => item.menuKey));
            
            const filteredNavigation = navigation.filter(item => {
              const hasAccess = canAccess(item.menuKey);
              console.log(`🎯 Menu "${item.name}" (${item.menuKey}) - Access: ${hasAccess}`);
              return hasAccess;
            });
            
            console.log('🎯 Filtered navigation items:', filteredNavigation.map(item => item.menuKey));
            console.log('🎯 ========== MENU FILTERING DEBUG END ==========');
            
            if (filteredNavigation.length === 0) {
              return !isCollapsed ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-sm">
                    🚨 No menu items accessible for role: {currentUser.role}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    User: {currentUser.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    Role: {JSON.stringify(currentUser.role)}
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
        )}
      </nav>

      {/* Auth Action */}
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