import React, { useEffect } from 'react';
import { Stack, Redirect, useRouter, useSegments } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/context/authContext';

// Auth guard function to protect routes
function AuthGuard() {
  const { isAuthenticated, isProfileComplete, isLoading, authInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth is initialized before making routing decisions
    if (isLoading || !authInitialized) return;

    console.log("AuthGuard: Auth state -", 
      isAuthenticated ? "Authenticated" : "Not authenticated", 
      isProfileComplete ? "Profile complete" : "Profile incomplete",
      "Current path:", segments.join('/'));

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inUserInfoScreen = inAuthGroup && segments[1] === 'user-info';

    // Handle navigation based on auth state
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign-in if not authenticated and not in auth group
      console.log("AuthGuard: Redirecting to sign-in (not authenticated)");
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated) {
      if (inAuthGroup && !inUserInfoScreen) {
        // Redirect to app if authenticated and trying to access auth screens (except user-info)
        console.log("AuthGuard: Redirecting to app (authenticated in auth group)");
        router.replace('/(app)');
      } else if (!isProfileComplete && !inUserInfoScreen && !inAuthGroup) {
        // If profile is incomplete, redirect to user-info
        console.log("AuthGuard: Redirecting to user-info (profile incomplete)");
        router.replace('/(auth)/user-info');
      }
    }
  }, [isAuthenticated, isProfileComplete, isLoading, authInitialized, segments, router]);

  return null;
}

// Root layout component
export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Handle loading state for fonts
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  // Wrap the app with AuthProvider and implement routing
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

// Separate component to use auth context inside
function RootLayoutContent() {
  const { isLoading } = useAuth();

  // Show loading screen while authentication is initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading app...</Text>
      </View>
    );
  }

  return(
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" options={{ title: 'Authentication' }} />
        <Stack.Screen name="(app)" options={{ title: 'App' }} />
      </Stack>
      <AuthGuard />
    </View>
  )

}