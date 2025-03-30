import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import * as SecureStore from 'expo-secure-store';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Force refresh function to trigger re-renders when needed
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Check if user is authenticated on mount and when refreshTrigger changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const currentUser = await authService.getCurrentUser();
        console.log('Current user:', currentUser ? 'Authenticated' : 'Not authenticated');
        
        // Store auth state in memory
        setUser(currentUser);
        
        if (currentUser) {
          // Fetch user profile
          console.log('Fetching user profile...');
          const userProfile = await authService.getUserProfile();
          console.log('User profile:', JSON.stringify(userProfile));
          console.log('Profile complete status:', userProfile?.profileComplete);
          
          setProfile(userProfile);
          
          // Also store auth info in secure storage as backup
          await SecureStore.setItemAsync('userAuthenticated', 'true');
        } else {
          // Clear any stored auth info
          await SecureStore.deleteItemAsync('userAuthenticated');
          // Ensure profile is also cleared
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If there's an error, clear user data to be safe
        setUser(null);
        setProfile(null);
        await SecureStore.deleteItemAsync('userAuthenticated');
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkAuth();
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Sign up function
  const signUp = async (email, password, fullname) => {
    try {
      console.log('Signing up:', email, fullname);
      const newAccount = await authService.createAccount(email, password, fullname);
      console.log('Account created, attempting login...');
      
      // Login after signup
      await signIn(email, password);
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign in function - updated with enhanced profile loading and logging
  const signIn = async (email, password) => {
    try {
      console.log('Signing in:', email);
      // Login user
      const session = await authService.login(email, password);
      console.log('Login successful, session established');
      
      // After successful login, get the current user
      console.log('Getting current user after login');
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Explicitly fetch user profile after login
        console.log('Fetching user profile after login');
        const userProfile = await authService.getUserProfile();
        console.log('User profile after login:', JSON.stringify(userProfile));
        console.log('Profile complete status:', userProfile?.profileComplete);
        
        setProfile(userProfile);
        
        // Store auth state in secure storage
        await SecureStore.setItemAsync('userAuthenticated', 'true');
        
        // Delay to ensure profile state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force a refresh to ensure all state is current
        forceRefresh();
      }
      
      return session;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Signing out...');
      // First clean up local state
      setUser(null);
      setProfile(null);
      
      // Then attempt to logout from Appwrite
      await authService.logout();
      
      // Clear secure storage
      await SecureStore.deleteItemAsync('userAuthenticated');
      
      // Force refresh auth state
      forceRefresh();
      
      // Navigate to auth screen
      router.replace('/(auth)/sign-in');
      
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error with the service, still clear local state
      setUser(null);
      setProfile(null);
      await SecureStore.deleteItemAsync('userAuthenticated');
      router.replace('/(auth)/sign-in');
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating profile for user:', user.$id);
      const updatedProfile = await authService.updateUserProfile(
        user.$id,
        profileData
      );
      
      console.log('Profile updated successfully');
      console.log('Updated profile data:', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      // Force a refresh to ensure state is current
      forceRefresh();
      
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Auth context value
  const value = {
    user,
    profile,
    isLoading,
    authInitialized,
    signUp,
    signIn,
    signOut,
    updateProfile,
    forceRefresh,
    isAuthenticated: !!user,
    isProfileComplete: profile?.profileComplete || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};