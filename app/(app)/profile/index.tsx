import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, School, Mail, Phone, CreditCard as Edit, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/authContext'; // Import the auth context

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
  const { signOut, user, profile } = useAuth(); // Use the auth context
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
              // Use the context signOut method instead of direct service call
              await signOut();
              // Navigation is handled in the context, so no need to call router here
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Logout Failed', 'Could not log out. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Use profile from context if available
        if (profile) {
          const formattedProfile = {
            id: profile.userId || profile.$id,
            email: profile.email || '',
            fullname: profile.fullname || '',
            phone: profile.phone || '',
            university: profile.university || '',
            course: profile.course || '',
            nationality: profile.nationality || '',
            interests: profile.interests || [],
            avatar: profile.avatar || 'https://via.placeholder.com/80',
            bio: profile.bio || ''
          };
          
          setUserProfile(formattedProfile);
        } else if (user) {
          // If we have user but no profile, fetch it
          const fetchedProfile = await authService.getUserProfile();
          
          if (fetchedProfile) {
            const formattedProfile = {
              id: fetchedProfile.userId || fetchedProfile.$id,
              email: fetchedProfile.email || '',
              fullname: fetchedProfile.fullname || '',
              phone: fetchedProfile.phone || '',
              university: fetchedProfile.university || '',
              course: fetchedProfile.course || '',
              nationality: fetchedProfile.nationality || '',
              interests: fetchedProfile.interests || [],
              avatar: fetchedProfile.avatar || 'https://via.placeholder.com/80',
              bio: fetchedProfile.bio || ''
            };
            
            setUserProfile(formattedProfile);
          } else {
            setError('Profile not found');
          }
        } else {
          // No user, redirect to sign in
          router.replace('/(auth)/sign-in');
        }
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, profile]);

  
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text style={styles.retryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No profile data available</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/(auth)/user-info')}
        >
          <Text style={styles.retryButtonText}>Complete Profile</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity 
              onPress={() => router.push('/profile/settings')}
              testID="settings-button"
            >
              <Settings size={24} color="#000" />
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});