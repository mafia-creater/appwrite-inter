import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService } from '../services/authService';

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

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const currentUser = await authService.getCurrentUser();
        console.log('Current user:', currentUser ? 'Authenticated' : 'Not authenticated');
        setUser(currentUser);
        
        if (currentUser) {
          // Fetch user profile
          console.log('Fetching user profile...');
          const userProfile = await authService.getUserProfile();
          console.log('User profile:', userProfile ? 'Found' : 'Not found');
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkAuth();
  }, []);

  // Sign up function
  const signUp = async (email, password, fullname) => {
    try {
      console.log('Signing up:', email, fullname);
      const newAccount = await authService.createAccount(email, password, fullname);
      console.log('Account created, attempting login...');
      await authService.login(email, password);
      
      // Update user state
      const currentUser = await authService.getCurrentUser();
      console.log('Current user after signup:', currentUser ? 'Authenticated' : 'Failed');
      setUser(currentUser);
      
      // Ensure we also get the profile
      if (currentUser) {
        const userProfile = await authService.getUserProfile();
        setProfile(userProfile);
      }
      
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('Signing in:', email);
      const session = await authService.login(email, password);
      
      // Update user state
      const currentUser = await authService.getCurrentUser();
      console.log('Current user after signin:', currentUser ? 'Authenticated' : 'Failed');
      setUser(currentUser);
      
      // Fetch user profile
      if (currentUser) {
        const userProfile = await authService.getUserProfile();
        console.log('User profile after signin:', userProfile ? 'Found' : 'Not found');
        setProfile(userProfile);
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
      await authService.logout();
      setUser(null);
      setProfile(null);
      
      // Navigate to auth screen
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
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
      setProfile(updatedProfile);
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
    isAuthenticated: !!user,
    isProfileComplete: profile?.profileComplete || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};