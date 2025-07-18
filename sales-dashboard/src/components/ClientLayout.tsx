'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import TopBar from './TopBar';
import GlobalNewCustomerModal from './GlobalNewCustomerModal';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Multiple checks untuk login page
  const isLoginPage = pathname === '/login' || pathname.includes('/login') || pathname.endsWith('/login');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // PENTING: Semua hooks harus dipanggil sebelum conditional return
  // Initialize and listen for sidebar toggle events from Navigation component
  useEffect(() => {
    // Load initial sidebar state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      const collapsed = JSON.parse(savedCollapsedState);
      setSidebarCollapsed(collapsed);
      console.log('🔧 ClientLayout: Loaded sidebar state from localStorage:', collapsed);
    }

    const handleSidebarToggle = (event: CustomEvent) => {
      const newCollapsedState = event.detail?.isCollapsed;
      if (newCollapsedState !== undefined) {
        setSidebarCollapsed(newCollapsedState);
        console.log('🔧 ClientLayout: Sidebar state updated from Navigation:', newCollapsedState);
      }
    };

    // Listen for custom event from Navigation
    window.addEventListener('sidebarToggled', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle as EventListener);
    };
  }, []);

  // Debug log yang lebih detail
  console.log('🔍 ClientLayout Debug:', { 
    pathname, 
    isLoginPage,
    pathIncludes: pathname.includes('/login'),
    pathEquals: pathname === '/login',
    pathEndsWith: pathname.endsWith('/login')
  });

  // Conditional rendering SETELAH semua hooks dipanggil
  if (isLoginPage) {
    console.log('🚪 LOGIN PAGE - NO LAYOUT');
    return (
      <div className="login-page-wrapper">
        {children}
      </div>
    );
  }

  console.log('🏠 DASHBOARD PAGE - FULL LAYOUT');
  return (
    <>
      <Navigation />
      
      {/* Content dengan conditional margin yang dinamis */}
      <div className={sidebarCollapsed ? 'ml-20' : 'ml-64'} style={{ transition: 'margin-left 0.3s ease' }}>
        <TopBar />
        <div className="p-3 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>

      {/* Global New Customer Modal - available on all pages */}
      <GlobalNewCustomerModal />
    </>
  );
} 