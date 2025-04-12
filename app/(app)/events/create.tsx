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
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isValid, parseISO } from 'date-fns';
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
    organizer: user?.name || user?.fullname || user?.$id || ''
  });
  
  // Date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormData({
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
    }
  };

  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setFormData({
        ...formData,
        time: format(selectedTime, 'HH:mm')
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) 
      newErrors.title = 'Title is required';
    
    if (!formData.description.trim()) 
      newErrors.description = 'Description is required';
    
    if (!formData.date) 
      newErrors.date = 'Date is required';
    
    if (!formData.time) 
      newErrors.time = 'Time is required';
    
    if (!formData.location.trim()) 
      newErrors.location = 'Location is required';
    
    if (!formData.category.trim()) 
      newErrors.category = 'Category is required';
    
    // Validate that the event is not in the past
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (isValid(eventDateTime) && eventDateTime < new Date()) {
        newErrors.date = 'Event cannot be scheduled in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        organizer: user?.name || user?.fullname || user?.$id,
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
      Alert.alert('Error', error.message || 'Failed to create event. Please try again.');
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

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., International Students Welcome Party"
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                if (errors.title) setErrors({...errors, title: ''});
              }}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              multiline
              placeholder="Describe your event..."
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                if (errors.description) setErrors({...errors, description: ''});
              }}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity 
                style={[styles.iconInput, errors.date && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#666" />
                <Text style={styles.iconTextInput}>
                  {formData.date || 'Select Date'}
                </Text>
              </TouchableOpacity>
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
            </View>
            
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity 
                style={[styles.iconInput, errors.time && styles.inputError]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color="#666" />
                <Text style={styles.iconTextInput}>
                  {formData.time || 'Select Time'}
                </Text>
              </TouchableOpacity>
              {errors.time ? <Text style={styles.errorText}>{errors.time}</Text> : null}
            </View>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <View style={[styles.iconInput, errors.location && styles.inputError]}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.iconTextInput}
                placeholder="Event location"
                value={formData.location}
                onChangeText={(text) => {
                  setFormData({ ...formData, location: text });
                  if (errors.location) setErrors({...errors, location: ''});
                }}
              />
            </View>
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={[styles.input, errors.category && styles.inputError]}
              placeholder="e.g., Social, Academic, Cultural"
              value={formData.category}
              onChangeText={(text) => {
                setFormData({ ...formData, category: text });
                if (errors.category) setErrors({...errors, category: ''});
              }}
            />
            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
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
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
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
});