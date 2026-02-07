
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Role, User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const { users, loading, isDemoMode } = useData();

  useEffect(() => {
    if (!loading) {
      const savedId = localStorage.getItem('motel_current_user_id');
      if (savedId) {
        const found = users.find(u => u.id === savedId);
        if (found) {
          setCurrentUser(found);
        } else if (savedId === 'emergency-admin') {
          setCurrentUser({
            id: 'emergency-admin',
            username: 'admin',
            role: Role.ADMIN,
            createdAt: new Date().toISOString()
          });
        }
      }
      setIsAuthenticating(false);
    }
  }, [users, loading]);

  const login = async (username: string, password: string): Promise<User | null> => {
    // 1. Check database users
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem('motel_current_user_id', user.id);
      return user;
    }

    // 2. Emergency Fallback / Demo Credentials
    if (username === 'admin' && password === 'zanous2311') {
      const emergencyUser: User = {
        id: 'emergency-admin',
        username: 'admin',
        role: Role.ADMIN,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(emergencyUser);
      localStorage.setItem('motel_current_user_id', 'emergency-admin');
      return emergencyUser;
    }

    // 3. Demo Mode default
    if (isDemoMode && username === '1' && password === '1') {
        const demoUser: User = {
            id: 'demo-user',
            username: 'مدیر دمو',
            role: Role.ADMIN,
            createdAt: new Date().toISOString()
        };
        setCurrentUser(demoUser);
        localStorage.setItem('motel_current_user_id', 'demo-user');
        return demoUser;
    }

    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('motel_current_user_id');
  };

  const hasRole = (roles: Role[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasRole, isAuthenticating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
