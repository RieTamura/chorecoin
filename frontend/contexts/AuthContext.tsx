import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api';

const AUTH_CHECK_TIMEOUT_MS = 5000;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          // タイムアウト処理を追加（5秒で中止）
          let timeoutId: ReturnType<typeof setTimeout> | null = null;
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Request timeout')), AUTH_CHECK_TIMEOUT_MS);
          });
          
          let userData;
          try {
            userData = await Promise.race([
              apiService.getMe(),
              timeoutPromise,
            ]);
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
          
          setUser(userData);
        } catch (apiError) {
          console.error('API call failed:', apiError);
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (idToken: string) => {
    try {
      const response = await apiService.loginWithGoogle(idToken);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const refreshUser = async () => {
    try {
      // タイムアウト処理を追加（5秒で中止）
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timeout')), AUTH_CHECK_TIMEOUT_MS);
      });
      
      let userData;
      try {
        userData = await Promise.race([
          apiService.getMe(),
          timeoutPromise,
        ]);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Refresh user failed:', error);
      logout();
    }
  };
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}