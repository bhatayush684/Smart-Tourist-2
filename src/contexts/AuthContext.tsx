import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import config from '../config/environment';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'tourist' | 'admin' | 'police' | 'id_issuer';
  touristId?: string;
  avatar?: string;
  status?: 'active' | 'pending' | 'suspended';
  department?: string;
  badgeNumber?: string;
  location?: string;
  idType?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, roleOverride?: User['role']) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'tourist' | 'admin' | 'police' | 'id_issuer';
  nationality?: string;
  phone?: string;
  department?: string;
  badgeNumber?: string;
  location?: string;
  idType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (config.demoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        try {
          setUser(JSON.parse(demoUser));
        } catch {}
      }
      setLoading(false);
      return;
    }

    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    if (config.demoMode) {
      // In demo mode, trust local user
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        try {
          setUser(JSON.parse(demoUser));
        } catch {}
      }
      setLoading(false);
      return;
    }
    try {
      const response = await apiService.verifyToken();
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, roleOverride?: User['role']) => {
    try {
      if (config.demoMode) {
        // Create a mock user with selected role
        const role = roleOverride || 'tourist';
        const mockUser: User = {
          id: 'demo-' + role,
          email: email || `${role}@demo.local`,
          name: role.charAt(0).toUpperCase() + role.slice(1) + ' Demo',
          role,
          status: 'active',
        };
        // Set fake tokens
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('refreshToken', 'demo-refresh-token');
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        setUser(mockUser);
        navigate('/');
        return;
      }

      const response = await apiService.login(email, password);
      if (response.success) {
        setUser(response.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      if (config.demoMode) {
        const mockUser: User = {
          id: 'demo-' + userData.role,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: 'active',
        };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('refreshToken', 'demo-refresh-token');
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        setUser(mockUser);
        navigate('/');
        return;
      }

      const response = await apiService.register(userData);
      if (response.success) {
        setUser(response.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!config.demoMode) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('demoUser');
      navigate('/login');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
