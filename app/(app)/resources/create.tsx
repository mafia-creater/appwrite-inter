import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { resourcesService } from '@/services/authService';

const categories = [
  { id: 'getting-started', name: 'Getting Started', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'housing', name: 'Housing', color: '#DBEAFE', textColor: '#1E40AF' },
  { id: 'academic', name: 'Academic', color: '#FCE7F3', textColor: '#831843' },
  { id: 'culture', name: 'Culture & Events', color: '#D1FAE5', textColor: '#065F46' },
  { id: 'transport', name: 'Transportation', color: '#FEE2E2', textColor: '#991B1B' },
  { id: 'health', name: 'Healthcare', color: '#E0E7FF', textColor: '#3730A3' },
];

export default function CreateResourceScreen() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    readTime: '',
    sections: [{ title: '', content: '' }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // In pickImage function, remove FormData and use proper file object
  const pickImage = async () => {
    try {
      setImageLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
  
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        // Create a file object that Appwrite can work with
        const file = {
          uri: uri,
          name: uri.split('/').pop(),
          type: `image/${uri.split('.').pop().toLowerCase()}`,
          size: result.assets[0].fileSize || 0,
        };
  
        setPreviewImage(uri);
        setImageFile(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    } finally {
      setImageLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your resource');
      return false;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }

    if (!formData.readTime) {
      Alert.alert('Error', 'Please estimate a read time (e.g., "5 min read")');
      return false;
    }

    // Validate that at least one section has content
    const hasContent = formData.sections.some(section =>
      section.title.trim() && section.content.trim()
    );

    if (!hasContent) {
      Alert.alert('Error', 'Please add content to at least one section');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Combine section content into a single content field
      const combinedContent = formData.sections
        .filter(section => section.title.trim() && section.content.trim())
        .map(section => `## ${section.title}\n\n${section.content}`)
        .join('\n\n');

      // Prepare resource data
      const resourceData = {
        title: formData.title,
        category: formData.category,
        content: combinedContent,
        readTime: formData.readTime,
      };

      // Create the resource
      const result = await resourcesService.createResource(resourceData, imageFile);

      // Show success message
      Alert.alert(
        'Success',
        'Your resource has been published successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating resource:', error);
      Alert.alert('Error', 'Failed to publish resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '' }],
    }));
  };

  const removeSection = (index) => {
    if (formData.sections.length <= 1) {
      Alert.alert('Error', 'You must have at least one content section');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Resource</Text>
          <TouchableOpacity
            style={[styles.publishButton, (isSubmitting || imageLoading) && styles.publishButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting || imageLoading}
          >
            <Text style={styles.publishButtonText}>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.coverImageSection}>
            {imageLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3366FF" />
                <Text style={styles.loadingText}>Processing image...</Text>
              </View>
            ) : previewImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                  }}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <ImageIcon size={24} color="#666" />
                <Text style={styles.uploadText}>Add Cover Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter a descriptive title..."
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Read Time</Text>
            <TextInput
              style={styles.readTimeInput}
              placeholder="E.g. 5 min read"
              value={formData.readTime}
              onChangeText={(text) => setFormData({ ...formData, readTime: text })}
              maxLength={20}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: category.color },
                    formData.category === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: category.textColor },
                      formData.category === category.id && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {formData.category === category.id && (
                    <View style={styles.selectedIndicator}></View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionsContainer}>
            <Text style={styles.sectionTitle}>Content Sections</Text>
            {formData.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionNumber}>Section {index + 1}</Text>
                  {formData.sections.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSection(index)}
                      style={styles.removeButton}
                    >
                      <X size={20} color="#FF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.sectionTitleInput}
                  placeholder="Section title..."
                  value={section.title}
                  onChangeText={(text) => updateSection(index, 'title', text)}
                  maxLength={100}
                />
                <TextInput
                  style={styles.sectionContentInput}
                  placeholder="Write your content here... Use Markdown for formatting."
                  multiline
                  textAlignVertical="top"
                  value={section.content}
                  onChangeText={(text) => updateSection(index, 'content', text)}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addSectionButton} onPress={addSection}>
              <Plus size={20} color="#666" />
              <Text style={styles.addSectionText}>Add Section</Text>
            </TouchableOpacity>
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
    paddingBottom: 48,
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  publishButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  form: {
    gap: 24,
  },
  coverImageSection: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  readTimeInput: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  categories: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#000',
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  categoryButtonTextSelected: {
    fontFamily: 'Inter_700Bold',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -4,
    right: '50%',
    width: 8,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
    transform: [{ translateX: 4 }],
  },
  sectionsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  sectionTitleInput: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  sectionContentInput: {
    height: 200,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    lineHeight: 24,
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addSectionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
});