import React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, School, Mail, Phone, CreditCard as Edit, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/authContext';

type UserProfile = {
  id?: string;
  email: string;
  fullname: string;
  phone: string;
  university: string;
  course: string;
  nationality: string;
  interests: string[];
  avatar: string;
  bio: string;
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProfileScreen Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>An error occurred. Please restart the app.</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function ProfileScreenContent() {
  const { signOut, user, profile, refreshUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const isMounted = useRef(true);
  
  // Format profile data helper
  const formatProfileData = (profileData: any): UserProfile => {
    return {
      id: profileData.userId || profileData.$id,
      email: profileData.email || '',
      fullname: profileData.fullname || '',
      phone: profileData.phone || '',
      university: profileData.university || '',
      course: profileData.course || '',
      nationality: profileData.nationality || '',
      interests: profileData.interests || [],
      avatar: profileData.avatar || 'https://via.placeholder.com/80',
      bio: profileData.bio || ''
    };
  };

  const fetchProfileData = useCallback(async () => {
    try {
      if (profile) {
        setUserProfile(formatProfileData(profile));
        setError('');
        return true;
      } else if (user) {
        console.log('Fetching profile from service...');
        const fetchedProfile = await authService.getUserProfile();
        
        if (fetchedProfile) {
          setUserProfile(formatProfileData(fetchedProfile));
          setError('');
          return true;
        } else {
          setError('Profile not found');
          return false;
        }
      } else {
        router.replace('/(auth)/sign-in');
        return false;
      }
    } catch (err) {
      console.error('Profile load error:', err);
      setError('Failed to load profile');
      return false;
    }
  }, [user, profile]);

  // Simple refresh function similar to the events page
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      await fetchProfileData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfileData, refreshUserProfile]);

  const logout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Logout Failed', 'Could not log out. Please try again.');
            } finally {
              if (isMounted.current) setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchProfileData();
      if (isMounted.current) setLoading(false);
    };
    
    loadInitialData();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchProfileData]); 

  // Update when profile changes
  useEffect(() => {
    if (profile && isMounted.current) {
      setUserProfile(formatProfileData(profile));
    }
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={[styles.content, styles.centerContent]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']}
              tintColor="#0000ff"
            />
          }
        >
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={[styles.content, styles.centerContent]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']}
              tintColor="#0000ff"
            />
          }
        >
          <Text style={styles.errorText}>No profile data available</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace('/(auth)/user-info')}
          >
            <Text style={styles.retryButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="profile-screen">
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
            tintColor="#0000ff"
          />
        }
        showsVerticalScrollIndicator={true}
        testID="profile-scroll-view"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => router.push('/profile/settings')}
                testID="settings-button"
              >
                <Settings size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userProfile.avatar || 'https://via.placeholder.com/80' }} 
            style={styles.avatar} 
            testID="profile-avatar"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name} testID="profile-name">
              {userProfile.fullname}
            </Text>
            {userProfile.email && (
              <Text style={styles.email} testID="profile-email">
                {userProfile.email}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push({
              pathname: '/profile/edit',
              params: { userId: userProfile.id }
            })}
            testID="edit-profile-button"
          >
            <Edit size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Info</Text>
          <View style={styles.infoItem}>
            <School size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>University</Text>
              <Text style={styles.infoValue} testID="university-text">
                {userProfile.university || 'Not specified'}
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <School size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Program</Text>
              <Text style={styles.infoValue} testID="course-text">
                {userProfile.course || 'Not specified'}
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <School size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue} testID="nationality-text">
                {userProfile.nationality || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.infoItem}>
            <Mail size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} testID="email-text">
                {userProfile.email}
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Phone size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue} testID="phone-text">
                {userProfile.phone || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {userProfile.interests?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interests}>
              {userProfile.interests.map((interest, index) => (
                <View key={`${interest}-${index}`} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {userProfile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{userProfile.bio}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={logout}
          testID="logout-button"
        >
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  return (
    <ErrorBoundary>
      <ProfileScreenContent />
    </ErrorBoundary>
  );
}

// styles remain the same...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    minHeight: Platform.OS === 'ios' ? '100%' : undefined, // Ensure iOS has enough to scroll
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  bioText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 24,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomPadding: {
    height: 60, // Extra space at bottom to ensure content is scrollable
  }
}); 