import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, MapPin, School, Mail, Phone, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/services/authService';

export default function EditProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
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
    avatar: 'https://via.placeholder.com/120',
  });

  useEffect(() => {
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
            avatar: userProfile.avatar || 'https://via.placeholder.com/120',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert comma-separated interests to array
      const interestsArray = formData.interests
        ? formData.interests.split(',').map(item => item.trim())
        : [];
      
      // Prepare updated profile data
      const updatedProfile = {
        fullname: formData.fullname,
        phone: formData.phone,
        university: formData.university,
        course: formData.program, // Match field name in database
        location: formData.location,
        nationality: formData.nationality,
        bio: formData.bio,
        interests: interestsArray,
        avatar: formData.avatar,
        notifications: formData.notifications,
        profileComplete: true
      };
      
      // Email cannot be changed directly, so don't include it in the update
      
      await authService.updateUserProfile(userId, updatedProfile);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      // Request permission to access the image library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your media library to update your photo');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // In a real app, you would upload this to your storage service
        // For now, we'll just update the local state with the URI
        setFormData({
          ...formData,
          avatar: selectedAsset.uri
        });
        
        // Note: In a production app, here you would:
        // 1. Upload the image to your storage service (e.g., Firebase, AWS S3)
        // 2. Get the URL from the uploaded image
        // 3. Update the user profile with the new avatar URL
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your camera to take a photo');
        return;
      }
      
      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedAsset = result.assets[0];
        
        // Update local state with the camera image URI
        setFormData({
          ...formData,
          avatar: capturedAsset.uri
        });
        
        // Same note as above regarding production implementation
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleSelectImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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

        <View style={styles.avatarSection}>
          <Image
            source={{ uri: formData.avatar }}
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={showImageOptions}
          >
            <Camera size={20} color="#666" />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
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