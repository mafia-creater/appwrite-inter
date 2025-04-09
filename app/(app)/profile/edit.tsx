import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, School, Mail, Phone, Save, Check } from 'lucide-react-native';
import { authService } from '@/services/authService';

// Predefined avatars from Unsplash
const avatars = [
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6aa11002bbe78fc39/view?project=67e04a47000d2aa438b3&mode=admin',
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6bbab001a1f3dc346/view?project=67e04a47000d2aa438b3&mode=admin',
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6bbc60004085b3c98/view?project=67e04a47000d2aa438b3&mode=admin',
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6bbce00118d9955c5/view?project=67e04a47000d2aa438b3&mode=admin',
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6bbd6003662a63d9a/view?project=67e04a47000d2aa438b3&mode=admin',
  'https://cloud.appwrite.io/v1/storage/buckets/67f6a9e4000ec696b0bd/files/67f6bbdd002fa193d7e8/view?project=67e04a47000d2aa438b3&mode=admin',
];

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    university: '',
    program: '',
    location: '',
    nationality: '',
    bio: '',
    interests: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getUserProfile();

      if (userProfile) {
        setFormData({
          fullname: userProfile.fullname || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          university: userProfile.university || '',
          program: userProfile.course || '',
          location: userProfile.location || '',
          nationality: userProfile.nationality || '',
          bio: userProfile.bio || '',
          interests: Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : '',
        });
        
        // Set the current avatar if available
        if (userProfile.avatar) {
          setSelectedAvatarUrl(userProfile.avatar);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert comma-separated interests to array
      const interestsArray = formData.interests
        ? formData.interests.split(',').map(item => item.trim())
        : [];
      
      // Prepare profile data
      const profileData = {
        fullname: formData.fullname,
        phone: formData.phone,
        university: formData.university,
        course: formData.program,
        location: formData.location,
        nationality: formData.nationality,
        bio: formData.bio,
        interests: interestsArray,
        avatar: selectedAvatarUrl, // Include the selected avatar URL
      };
      
      // Update profile
      await authService.updateProfile(profileData);
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Update Failed', `Could not update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Save size={24} color="#000" />
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar Selection Grid */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {avatars.map((avatarUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarItem,
                  selectedAvatarUrl === avatarUrl && styles.selectedAvatarItem,
                ]}
                onPress={() => setSelectedAvatarUrl(avatarUrl)}
              >
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                {selectedAvatarUrl === avatarUrl && (
                  <View style={styles.checkmarkOverlay}>
                    <Check size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form fields */}
        <View style={styles.form}>
          {/* Personal Information section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullname}
                onChangeText={(text) => setFormData({ ...formData, fullname: text })}
                testID="fullname-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                testID="bio-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.iconInput}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  testID="location-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nationality</Text>
              <TextInput
                style={styles.input}
                value={formData.nationality}
                onChangeText={(text) => setFormData({ ...formData, nationality: text })}
                testID="nationality-input"
              />
            </View>
          </View>

          {/* Academic Information section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>University</Text>
              <View style={styles.iconInput}>
                <School size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.university}
                  onChangeText={(text) => setFormData({ ...formData, university: text })}
                  testID="university-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Program</Text>
              <View style={styles.iconInput}>
                <School size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.program}
                  onChangeText={(text) => setFormData({ ...formData, program: text })}
                  testID="program-input"
                />
              </View>
            </View>
          </View>

          {/* Contact Information section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.iconInput}>
                <Mail size={20} color="#666" />
                <TextInput
                  style={[styles.iconTextInput, styles.disabledInput]}
                  value={formData.email}
                  editable={false}
                  testID="email-input"
                />
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.iconInput}>
                <Phone size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.phone}
                  keyboardType="phone-pad"
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  testID="phone-input"
                />
              </View>
            </View>
          </View>

          {/* Interests section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Add your interests (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.interests}
                onChangeText={(text) => setFormData({ ...formData, interests: text })}
                placeholder="e.g., Politics, Travel, Photography"
                testID="interests-input"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    padding: 8,
  },
  // Avatar grid styles
  avatarSection: {
    marginBottom: 32,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  avatarItem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarItem: {
    borderColor: '#000',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Form styles
  form: {
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  iconTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginLeft: 8,
  },
  disabledInput: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});