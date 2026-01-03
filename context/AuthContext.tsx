import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Role, User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { users } = useData();

  useEffect(() => {
    const savedId = localStorage.getItem('motel_current_user_id');
    if (savedId && users.length > 0) {
      const found = users.find(u => u.id === savedId);
      if (found) setCurrentUser(found);
    }
  }, [users]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem('motel_current_user_id', user.id);
      return true;
    }
    return false;
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
    <AuthContext.Provider value={{ currentUser, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};