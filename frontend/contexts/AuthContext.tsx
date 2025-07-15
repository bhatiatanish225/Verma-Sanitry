import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/api';
import { authService } from '@/services/api';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, city?: string, code?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  sendOTP: (email: string) => Promise<{ error: any; code?: string }>;
  verifyOTP: (email: string, code: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if user is already logged in
    checkCurrentUser();
  }, []);

  // Navigate when user changes
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading]);

  const checkCurrentUser = async () => {
    try {
      // Check if token exists in storage
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid, remove it
          await AsyncStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      // If there's an error, remove the token
      await AsyncStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        return { error: null, code: response.data?.code };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  const verifyOTP = async (email: string, code: string) => {
    try {
      const response = await authService.verifyOTP(email, code);
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, city?: string, code?: string) => {
    try {
      setIsLoading(true);
      
      if (!code) {
        return { error: { message: 'OTP verification code is required' } };
      }

      const response = await authService.register({
        email,
        password,
        full_name: fullName,
        phone,
        city,
        code,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await authService.resetPassword(email);
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      resetPassword,
      sendOTP,
      verifyOTP,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};