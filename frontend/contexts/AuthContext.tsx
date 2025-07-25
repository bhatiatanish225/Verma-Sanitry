import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/api';
import { authService } from '@/services/api';
import { router } from 'expo-router';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  // Multi-step signup functions
  signupStep1: (userData: { name: string; email: string; phone: string }) => Promise<{ error: any; code?: string }>;
  signupStep2: (email: string, otp: string) => Promise<{ error: any }>;
  signupStep3: (userData: { email: string; password: string; city: string }) => Promise<{ error: any }>;
  // Existing functions for backward compatibility
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
    if (!isLoading) {
      if (user) {
        // Use setTimeout to ensure navigation happens after component mount
        setTimeout(() => {
          if (user.role === 'admin') {
            router.replace('/(admin)');
          } else {
            router.replace('/(tabs)');
          }
        }, 100);
      } else {
        // User is null (logged out), navigate to welcome screen
        setTimeout(() => {
          router.replace('/');
        }, 100);
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

  // Multi-step signup functions
  const signupStep1 = async (userData: { name: string; email: string; phone: string }) => {
    try {
      const response = await authService.signupStep1(userData);
      if (response.success) {
        return { error: null, code: response.data?.code };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signupStep2 = async (email: string, otp: string) => {
    try {
      const response = await authService.signupStep2(email, otp);
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signupStep3 = async (userData: { email: string; password: string; city: string }) => {
    try {
      setIsLoading(true);
      
      const response = await authService.signupStep3(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: response.error || 'Registration failed' } };
      }
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
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
        return { error: { message: response.error || 'Registration failed' } };
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
        return { error: { message: response.error || 'Login failed' } };
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
      // Always clear user state and token, regardless of API call result
      setUser(null);
      await authService.logout();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout API fails, we still want to clear the user state
      setUser(null);
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
        return { error: { message: response.error || 'Password reset failed' } };
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
      signupStep1,
      signupStep2,
      signupStep3,
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