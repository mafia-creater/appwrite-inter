import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X, Plus } from 'lucide-react-native';

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
    coverImage: '',
    sections: [{ title: '', content: '' }],
  });

  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop');

  const handleSubmit = () => {
    // Handle form submission
    router.back();
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '' }],
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
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
          <TouchableOpacity style={styles.publishButton} onPress={handleSubmit}>
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.coverImageSection}>
            {previewImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setPreviewImage('')}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton}>
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
                    ]}
                  >
                    {category.name}
                  </Text>
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
                  {index > 0 && (
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
  categories: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonSelected: {
    transform: [{ scale: 0.95 }],
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
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