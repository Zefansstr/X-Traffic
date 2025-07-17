import { useState, useEffect } from 'react';
import { canUserAccessMenu, canUserPerformAction, type User, type RolePermissions } from '../models/User';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'administrator' | 'manager' | 'operator' | 'user' | 'viewer';
  full_name: string;
  is_active: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('authUser');
        const token = localStorage.getItem('authToken');
        
        if (userStr && token) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('✅ useAuth: User loaded from localStorage', userData);
        } else {
          console.log('❌ useAuth: No user or token found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ useAuth: Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Load user on mount
    loadUser();

    // Listen for auth state changes (login/logout events)
    const handleAuthStateChanged = () => {
      console.log('🔄 useAuth: Auth state changed event received');
      loadUser();
    };

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authUser' || e.key === 'authToken') {
        console.log('🔄 useAuth: Storage changed, reloading user');
        loadUser();
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChanged);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData: AuthUser, token: string) => {
    setUser(userData);
    // Set localStorage
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
    
    // Set cookies untuk middleware
    if (typeof document !== 'undefined') {
      document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `authUser=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    console.log('✅ useAuth: User logged in successfully', userData);
  };

  const logout = () => {
    setUser(null);
    // Hapus localStorage
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authExpires');
    sessionStorage.clear();
    
    // Hapus cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    console.log('🚪 useAuth: User logged out, redirecting to login...');
    window.location.href = '/login';
  };

  const canAccessMenu = (menuName: keyof RolePermissions['canAccessMenu']) => {
    if (!user) {
      console.log('🚫 useAuth canAccessMenu: No user');
      return false;
    }
    console.log(`🔍 useAuth canAccessMenu: ${user.role} -> ${menuName}`);
    return canUserAccessMenu(user.role, menuName);
  };

  const canPerformAction = (action: keyof RolePermissions['canPerformActions']) => {
    if (!user) {
      console.log('🚫 useAuth canPerformAction: No user');
      return false;
    }
    console.log(`🔍 useAuth canPerformAction: ${user.role} -> ${action}`);
    const result = canUserPerformAction(user.role, action);
    console.log(`🔍 useAuth canPerformAction result: ${user.role} -> ${action} = ${result}`);
    return result;
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    canAccessMenu,
    canPerformAction,
  };
}; 