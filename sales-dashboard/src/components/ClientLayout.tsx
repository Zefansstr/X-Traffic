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
  const isLoginPage = pathname === '/login';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar toggle events from Navigation component
  useEffect(() => {
    const handleSidebarToggle = () => {
      setSidebarCollapsed(prev => !prev);
    };

    // Listen for custom event from Navigation
    window.addEventListener('sidebarToggled', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, []);

  return (
    <>
      {/* Jangan tampilkan Navigation di halaman login */}
      {!isLoginPage && <Navigation />}
      
      {/* Content dengan conditional margin yang dinamis */}
      <div className={isLoginPage ? '' : sidebarCollapsed ? 'ml-20' : 'ml-64'} style={{ transition: 'margin-left 0.3s ease' }}>
        {!isLoginPage && <TopBar />}
        {isLoginPage ? (
          children
        ) : (
          <div className="p-3 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        )}
      </div>

      {/* Global New Customer Modal - available on all pages */}
      {!isLoginPage && <GlobalNewCustomerModal />}
    </>
  );
} 