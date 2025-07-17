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
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
  };

  const logout = () => {
    setUser(null);
    // Hapus localStorage
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authExpires');
    
    // Hapus cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
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