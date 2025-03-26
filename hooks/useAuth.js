import { useState, useEffect, useCallback } from 'react';
import { Account, ID, Client } from 'react-native-appwrite';
import { client } from '@/lib/appwrite';
import { useRouter, useSegments } from 'expo-router';
import { Alert } from 'react-native';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  const account = new Account(client);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const login = useCallback(async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [account, checkAuthStatus]);

  const signup = useCallback(async (email, password, additionalInfo = {}) => {
    try {
      const newUser = await account.create(
        ID.unique(), 
        email, 
        password
      );

      await account.createEmailPasswordSession(email, password);

      if (Object.keys(additionalInfo).length > 0) {
        await account.updatePrefs(additionalInfo);
      }

      await checkAuthStatus();
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [account, checkAuthStatus]);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout error', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [account, router]);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Protected route logic
  useEffect(() => {
    if (isLoading) return;
  
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated) {
      // Redirect all unauthenticated users to onboarding
      router.replace('/(auth)/onboarding');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users away from auth routes
      router.replace('/(app)/home');
    }
  }, [isAuthenticated, isLoading, segments]);

  return {
    login,
    signup,
    logout,
    checkAuthStatus,
    user,
    isAuthenticated,
    isLoading,
  };
}

// Higher-Order Component for Protected Routes
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/sign-in');
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return null; // or a loading component
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}