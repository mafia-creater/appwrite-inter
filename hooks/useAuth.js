import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import appwriteService from '../lib/appwrite';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await appwriteService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          // If we're on an auth page, redirect to app
          if (router.pathname.includes('/(auth)')) {
            router.replace('/(app)');
          }
        } else {
          // If we're on an app page, redirect to auth
          if (router.pathname.includes('/(app)')) {
            router.replace('/(auth)/sign-in');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const session = await appwriteService.login(email, password);
      const currentUser = await appwriteService.getCurrentUser();
      setUser(currentUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email, password, fullname) => {
    try {
      const account = await appwriteService.createAccount(email, password, fullname);
      setUser(account);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const updatedProfile = await appwriteService.updateProfile(userData);
      
      // Update the user state with the new profile data
      setUser(prev => ({
        ...prev,
        profile: updatedProfile
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await appwriteService.logout();
      setUser(null);
      router.replace('/(auth)/sign-in');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // The value to be provided by the context
  const authContext = {
    user,
    loading,
    authInitialized,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}