import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, role?: UserRole) => boolean;
  signup: (name: string, email: string, role: UserRole, phone?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  loginAsDemoRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'mtaawatch_auth_user';

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  Administrator: {
    id: 'user-admin-01',
    name: 'Dr. Anne Wambui',
    email: 'anne.wambui@mtaawatch.ke',
    role: 'Administrator',
    phone: '+254 700 889 900',
    county: 'Nairobi City County',
    department: 'Urban Intelligence & Civic Operations',
  },
  'Authority Officer': {
    id: 'user-officer-01',
    name: 'Eng. Dennis Kiprono',
    email: 'dennis.kiprono@kura.go.ke',
    role: 'Authority Officer',
    phone: '+254 722 445 566',
    county: 'Kiambu County',
    department: 'Kenya Urban Roads Authority (KURA)',
  },
  'Community Reporter': {
    id: 'user-citizen-01',
    name: 'Grace Mwende',
    email: 'grace.mwende@community.ke',
    role: 'Community Reporter',
    phone: '+254 712 334 455',
    county: 'Kiambu County',
    subCounty: 'Ruiru',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Administrator for rich initial exploratory experience
    return DEMO_PROFILES['Administrator'];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, role: UserRole = 'Community Reporter') => {
    const existing = Object.values(DEMO_PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      return true;
    }
    // Create new profile
    const name = email.split('@')[0].replace('.', ' ') || 'Citizen User';
    const newProfile: UserProfile = {
      id: 'user-' + Date.now(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role,
    };
    setUser(newProfile);
    return true;
  };

  const signup = (name: string, email: string, role: UserRole, phone?: string) => {
    const newProfile: UserProfile = {
      id: 'user-' + Date.now(),
      name,
      email,
      role,
      phone,
    };
    setUser(newProfile);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    } else {
      setUser(DEMO_PROFILES[role]);
    }
  };

  const loginAsDemoRole = (role: UserRole) => {
    setUser(DEMO_PROFILES[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        switchRole,
        loginAsDemoRole,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
