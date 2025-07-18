export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: 'administrator' | 'manager' | 'operator' | 'user' | 'viewer';
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateUserData {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: 'administrator' | 'manager' | 'operator' | 'user' | 'viewer';
  full_name: string;
  created_by?: string;
}

export interface UpdateUserData {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: 'administrator' | 'manager' | 'operator' | 'user' | 'viewer';
  full_name?: string;
  is_active?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: Omit<User, 'password_hash'>;
  token: string;
  expires_at: string;
}

// Role-based permissions
export interface RolePermissions {
  canAccessMenu: {
    dashboard: boolean;
    member: boolean;
    reports: boolean;
    business: boolean;
    commission: boolean;
    setting: boolean;
    operator: boolean;
  };
  canPerformActions: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<User['role'], RolePermissions> = {
  administrator: {
    canAccessMenu: {
      dashboard: true,
      member: true,
      reports: true,
      business: true,
      commission: true,
      setting: true,
      operator: true,
    },
    canPerformActions: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
  },
  manager: {
    canAccessMenu: {
      dashboard: true,
      member: true,
      reports: true,
      business: true,
      commission: true,
      setting: true,
      operator: false, // Tidak diizinkan menu Operator
    },
    canPerformActions: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
  },
  operator: {
    canAccessMenu: {
      dashboard: true,
      member: true,
      reports: true,
      business: true,
      commission: true,
      setting: false, // Tidak diizinkan menu Setting dan Operator
      operator: false,
    },
    canPerformActions: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
  },
  user: {
    canAccessMenu: {
      dashboard: true,
      member: true,
      reports: true,
      business: true,
      commission: true,
      setting: false, // Tidak ada menu Setting dan Operator
      operator: false,
    },
    canPerformActions: {
      create: true,
      edit: false, // Tidak bisa edit
      delete: false, // Tidak bisa delete
      view: true,
    },
  },
  viewer: {
    canAccessMenu: {
      dashboard: true,
      member: false, // Tidak bisa menambahkan member
      reports: true,
      business: true,
      commission: true,
      setting: false,
      operator: false,
    },
    canPerformActions: {
      create: false, // Tidak bisa menambahkan apapun
      edit: false,
      delete: false,
      view: true, // Hanya bisa melihat
    },
  },
};

// Helper functions
export const getRolePermissions = (role: User['role']): RolePermissions => {
  return ROLE_PERMISSIONS[role];
};

export const canUserAccessMenu = (userRole: User['role'], menuName: keyof RolePermissions['canAccessMenu']): boolean => {
  try {
    // Add validation
    if (!userRole) {
      console.warn('⚠️ canUserAccessMenu: userRole is undefined');
      return false;
    }
    
    if (!menuName) {
      console.warn('⚠️ canUserAccessMenu: menuName is undefined');
      return false;
    }
    
    // Handle legacy admin role (fallback)
    let normalizedRole = userRole;
    if (userRole === ('admin' as string)) {
      normalizedRole = 'administrator';
      console.log('🔄 Converting legacy admin role to administrator');
    }
    
    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
    if (!rolePermissions) {
      console.warn(`⚠️ canUserAccessMenu: No permissions found for role: ${userRole} (normalized: ${normalizedRole})`);
      
      // Fallback untuk administrator jika role tidak ditemukan
      if (userRole === ('admin' as string) || userRole === 'administrator') {
        console.log('🔧 Using fallback administrator permissions');
        return true;
      }
      
      return false;
    }
    
    const canAccessMenu = rolePermissions.canAccessMenu;
    if (!canAccessMenu) {
      console.warn(`⚠️ canUserAccessMenu: canAccessMenu is undefined for role: ${userRole}`);
      return false;
    }
    
    const hasAccess = canAccessMenu[menuName];
    console.log(`🔍 canUserAccessMenu: ${userRole} -> ${menuName} = ${hasAccess}`);
    
    return hasAccess;
  } catch (error) {
    console.error('🚨 Error in canUserAccessMenu:', error, { userRole, menuName });
    
    // Emergency fallback untuk admin roles
    if (userRole === ('admin' as string) || userRole === 'administrator') {
      console.log('🚨 Emergency fallback: granting access to admin user');
      return true;
    }
    
    return false;
  }
};

export const canUserPerformAction = (userRole: User['role'], action: keyof RolePermissions['canPerformActions']): boolean => {
  try {
    // Add validation
    if (!userRole) {
      console.warn('⚠️ canUserPerformAction: userRole is undefined');
      return false;
    }
    
    if (!action) {
      console.warn('⚠️ canUserPerformAction: action is undefined');
      return false;
    }
    
    // Handle legacy admin role (fallback)
    let normalizedRole = userRole;
    if (userRole === ('admin' as string)) {
      normalizedRole = 'administrator';
      console.log('🔄 Converting legacy admin role to administrator for action:', action);
    }
    
    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
    if (!rolePermissions) {
      console.warn(`⚠️ canUserPerformAction: No permissions found for role: ${userRole} (normalized: ${normalizedRole})`);
      
      // Fallback untuk administrator jika role tidak ditemukan
      if (userRole === ('admin' as string) || userRole === 'administrator') {
        console.log('🔧 Using fallback administrator action permissions for:', action);
        return true;
      }
      
      return false;
    }
    
    const canPerformActions = rolePermissions.canPerformActions;
    if (!canPerformActions) {
      console.warn(`⚠️ canUserPerformAction: canPerformActions is undefined for role: ${userRole}`);
      return false;
    }
    
    const hasPermission = canPerformActions[action];
    console.log(`🔍 canUserPerformAction: ${userRole} -> ${action} = ${hasPermission}`);
    
    return hasPermission;
  } catch (error) {
    console.error('🚨 Error in canUserPerformAction:', error, { userRole, action });
    
    // Emergency fallback untuk admin roles
    if (userRole === ('admin' as string) || userRole === 'administrator') {
      console.log('🚨 Emergency fallback: granting action permission to admin user for:', action);
      return true;
    }
    
    return false;
  }
}; 