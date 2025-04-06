import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, MapPin, School, Mail, Phone, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/services/authService';

export default function EditProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
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
        profileComplete: true
      };
      
      // Use updateUserProfileWithAvatar instead of normal updateUserProfile
      // This ensures proper handling of the avatar image
      await authService.updateUserProfileWithAvatar(userId, updatedProfile, formData.avatar);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImageToStorage = async (imageUri) => {
    try {
      // Show uploading indicator
      setUploading(true);
      
      // Set the image URI directly in the form data
      // The actual upload will happen in updateUserProfileWithAvatar when saving
      setFormData({
        ...formData,
        avatar: imageUri
      });
      
      return imageUri;
    } catch (err) {
      console.error('Error setting image:', err);
      Alert.alert('Error', 'Failed to set image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const handleSelectImage = async () => {
    try {
      // Close the image options modal
      setImageOptionsVisible(false);
      
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
        
        // Set the image URI
        await uploadImageToStorage(selectedAsset.uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const handleTakePhoto = async () => {
    try {
      // Close the image options modal
      setImageOptionsVisible(false);
      
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
        
        // Set the image URI
        await uploadImageToStorage(capturedAsset.uri);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Show image options modal
  const showImageOptions = () => {
    setImageOptionsVisible(true);
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
          {uploading ? (
            <View style={[styles.avatar, styles.avatarLoading]}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <Image
              source={{ uri: formData.avatar }}
              style={styles.avatar}
            />
          )}
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={showImageOptions}
          >
            <Camera size={20} color="#666" />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Image options modal */}
        <Modal
          visible={imageOptionsVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setImageOptionsVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Profile Photo</Text>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handleTakePhoto}
              >
                <Camera size={24} color="#333" />
                <Text style={styles.modalOptionText}>Take a Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handleSelectImage}
              >
                <Image 
                  source={require('@/assets/images/gallery-icon.png')} 
                  style={styles.modalIcon} 
                />
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setImageOptionsVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  avatarLoading: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    gap: 16,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  modalIcon: {
    width: 24,
    height: 24,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#ff3b30',
  },
});