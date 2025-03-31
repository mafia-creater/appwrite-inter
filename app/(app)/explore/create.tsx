import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Euro, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { housingService } from '@/services/authService';

export default function CreateHousingScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    furnished: false,
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Updated image picker function similar to events
  const pickImages = async () => {
    try {
      // Request permissions first
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        // Add new images to existing images
        setImages([...images, ...result.assets]);
      }
    } catch (e) {
      console.error('Error picking images:', e);
      setError('Failed to pick images. Please try again.');
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Prepare file for upload (similar to events)
  const prepareImageFiles = async () => {
    if (!images || images.length === 0) return [];
    
    return images.map(img => {
      // Get file extension
      const uriParts = img.uri.split('.');
      const extension = uriParts[uriParts.length - 1];
      
      // Create file object
      return {
        uri: img.uri,
        name: `housing-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`,
        type: img.type || `image/${extension}`,
        size: img.fileSize
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
  
      // Validate form
      if (!formData.title || !formData.price || !formData.address) {
        setError('Please fill in all required fields: title, price, and address.');
        setIsSubmitting(false);
        return;
      }
  
      // Extract type field and get the rest of the data
      const { type, ...restFormData } = formData;
      
      // Convert string values to numbers and restructure data
      const listingData = {
        ...restFormData,
        property_type: type,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        area: formData.area ? parseFloat(formData.area) : 0,
      };
  
      // Prepare images for upload (similar to events approach)
      const imageFiles = await prepareImageFiles();
  
      // Create the housing listing
      await housingService.createHousingListing(listingData, imageFiles);
      
      // Show success message
      Alert.alert('Success', 'Property listing created successfully!');
      
      // Navigate back
      router.back();
    } catch (e) {
      console.error('Error submitting housing listing:', e);
      setError('Failed to create listing. ' + (e.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>List Property</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title*</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Modern Studio near University"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Describe your property..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Price*</Text>
              <View style={styles.priceInput}>
                <Euro size={20} color="#666" />
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
                <Text style={styles.perMonth}>/month</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Neighborhood, City"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Full address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.typeContainer}>
              {['apartment', 'house', 'room', 'studio'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Area (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.area}
                onChangeText={(text) => setFormData({ ...formData, area: text })}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Furnished</Text>
            <Switch
              value={formData.furnished}
              onValueChange={(value) => setFormData({ ...formData, furnished: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Photos</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
              <ImageIcon size={24} color="#666" />
              <Text style={styles.imageButtonText}>Add Photos</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>List Property</Text>
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
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginLeft: 8,
  },
  perMonth: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});