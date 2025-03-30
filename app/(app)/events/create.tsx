import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Euro, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { eventsService } from '@/services/authService';
import { useAuth } from '@/context/authContext';

export default function CreateEventScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    capacity: '',
    price: '',
    organizer: user.name || user.fullname || user.$id || ''
  });
  
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Function to pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.date || 
        !formData.time || !formData.location || !formData.category) {
      setErrorMsg('Please fill all required fields');
      return false;
    }
    return true;
  };

  // Prepare file for upload
  const prepareFile = async (imageAsset) => {
    if (!imageAsset) return null;
    
    // Get file extension
    const uriParts = imageAsset.uri.split('.');
    const extension = uriParts[uriParts.length - 1];
    
    // Create file object
    const file = {
      uri: imageAsset.uri,
      name: `event-${Date.now()}.${extension}`,
      type: `image/${extension}`,
      size: imageAsset.fileSize
    };
    
    return file;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;
      
      setIsLoading(true);
      setErrorMsg('');
      
      // Format data for backend
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category,
        capacity: parseInt(formData.capacity) || 0,
        price: parseFloat(formData.price) || 0,
        organizer: user.name || user.fullname || user.$id,
      };
      
      // Prepare image file if exists
      const imageFile = image ? await prepareFile(image) : null;
      
      // Create event
      await eventsService.createEvent(eventData, imageFile);
      
      // Success
      Alert.alert('Success', 'Event created successfully!');
      router.back();
      
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMsg(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., International Students Welcome Party"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Describe your event..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.iconInput}>
                <Calendar size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Time *</Text>
              <View style={styles.iconInput}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  placeholder="HH:MM"
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.iconInput}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.iconTextInput}
                placeholder="Event location"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Social, Academic, Cultural"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Capacity</Text>
              <View style={styles.iconInput}>
                <Users size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  placeholder="Max attendees"
                  keyboardType="numeric"
                  value={formData.capacity}
                  onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                />
              </View>
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.iconInput}>
                <Euro size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
              </View>
            </View>
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <ImageIcon size={24} color="#666" />
            <Text style={styles.imageButtonText}>
              {image ? 'Change Cover Image' : 'Add Cover Image'}
            </Text>
          </TouchableOpacity>
          
          {/* Show selected image preview */}
          {image && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>Image Selected: {image.fileName || 'image'}</Text>
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  form: {
    gap: 24,
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
  row: {
    flexDirection: 'row',
    gap: 16,
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
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  imageButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  imagePreviewContainer: {
    marginTop: -12,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  imagePreviewText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Inter_400Regular',
  },
  removeImageButton: {
    padding: 6,
  },
  removeImageText: {
    color: '#ff3b30',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});