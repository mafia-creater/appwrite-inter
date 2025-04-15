import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { useAuth } from '@/context/authContext';

type Step = {
  id: number;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'tel' | 'select' | 'tags';
    options?: string[];
  }>;
};

const steps: Step[] = [
  {
    id: 1,
    title: 'Personal Information',
    fields: [
      { key: 'fullname', label: 'Full Name', placeholder: 'Enter your full name' },
      { key: 'phone', label: 'Phone Number', placeholder: '+39 XXX XXX XXXX', type: 'tel' },
    ],
  },
  {
    id: 2,
    title: 'Academic Details',
    fields: [
      { key: 'university', label: 'University', placeholder: 'Enter your university name', type: 'text' },
      { key: 'course', label: 'Course/Program', placeholder: 'Enter your course or program' },
    ],
  },
  {
    id: 3,
    title: 'Additional Information',
    fields: [
      { key: 'nationality', label: 'Nationality', placeholder: 'Enter your nationality' },
      { key: 'interests', label: 'Interests', placeholder: 'Add your interests', type: 'tags' },
    ],
  },
];

// Predefined interest options for the tag buttons
const interestOptions = [
  'Sports', 'Music', 'Art', 'Reading', 'Travel',
  'Technology', 'Food', 'Photography', 'Fashion', 'Gaming',
  'Fitness', 'Movies', 'Dance', 'Languages', 'Writing'
];

export default function UserInfoScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ interests: [] });
  const [loading, setLoading] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  // Use the auth context
  const { user, profile, updateProfile, isAuthenticated } = useAuth();

  // Get current user profile when component mounts
  useEffect(() => {
    if (!user) {
      console.warn("UserInfoScreen: No authenticated user found!");
      return;
    }

    console.log("UserInfoScreen: User authenticated:", user.$id);

    if (profile) {
      console.log("UserInfoScreen: Profile found:", profile.$id);
      // Pre-fill form data with existing profile data
      const processedProfile = { ...profile };

      // Ensure interests is an array
      if (profile.interests && !Array.isArray(profile.interests)) {
        // If somehow the interest is not an array (e.g. string from older version),
        // convert it to an array
        try {
          if (typeof profile.interests === 'string') {
            processedProfile.interests = profile.interests.split(',').map(item => item.trim());
          }
        } catch (e) {
          processedProfile.interests = [];
        }
      } else if (!profile.interests) {
        processedProfile.interests = [];
      }

      setFormData(processedProfile);
    } else {
      console.log("UserInfoScreen: No profile found for user:", user?.$id);
      // Initialize interests as empty array
      setFormData(prev => ({ ...prev, interests: [] }));
    }
  }, [user, profile]);

  const handleNext = async () => {
    // Validate current step data
    const currentStepFields = steps[currentStep].fields;
    const missingFields = currentStepFields
      .filter(field => {
        if (field.key === 'interests') {
          return !formData[field.key] || !formData[field.key].length;
        }
        return !formData[field.key];
      })
      .map(field => field.label);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    if (currentStep < steps.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1);
    } else {
      // This is the final step - save profile data to Appwrite
      setLoading(true);

      try {
        if (!user) {
          console.error("UserInfoScreen: No authenticated user found!");
          throw new Error('User not authenticated');
        }

        console.log("UserInfoScreen: Attempting to update profile for user:", user.$id);

        // Make a copy of form data
        const dataToSave = { ...formData };

        // Remove Appwrite metadata fields that start with $
        Object.keys(dataToSave).forEach(key => {
          if (key.startsWith('$')) {
            delete dataToSave[key];
          }
        });

        // Ensure interests is an array
        if (!Array.isArray(dataToSave.interests)) {
          dataToSave.interests = [];
        }

        // Save the clean profile data
        const result = await updateProfile(dataToSave);
        console.log("UserInfoScreen: Profile update result:", result?.$id);

        // Show success message
        Alert.alert(
          'Profile Completed',
          'Your profile has been saved successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(app)') }]
        );
      } catch (error) {
        console.error('Error saving profile:', error);
        Alert.alert('Error', `Failed to save your profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const addInterest = (interest) => {
    if (!interest.trim()) return;

    // Check if the interest already exists
    if (!formData.interests || !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interest.trim()]
      }));
    }
    setNewInterest('');
  };

  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const toggleInterestTag = (interest) => {
    if (formData.interests && formData.interests.includes(interest)) {
      removeInterest(interest);
    } else {
      addInterest(interest);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Add log to check authentication status
  useEffect(() => {
    console.log("UserInfoScreen: Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    console.log("UserInfoScreen: User:", user ? user.$id : "No user");
  }, [isAuthenticated, user]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>Step {currentStep + 1} of {steps.length}</Text>
        </View>

        <View style={styles.progress}>
          {steps.map((s, index) => (
            <View
              key={s.id}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.form}>
          {step.fields.map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>

              {field.type === 'tags' ? (
                <View>
                  {/* Selected interests tags */}
                  <View style={styles.tagsContainer}>
                    {formData.interests && formData.interests.map((interest, index) => (
                      <View key={`selected-${index}`} style={styles.tag}>
                        <Text style={styles.tagText}>{interest}</Text>
                        <TouchableOpacity onPress={() => removeInterest(interest)}>
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* Add custom interest input */}
                  <View style={styles.customTagInput}>
                    <TextInput
                      style={styles.tagInput}
                      placeholder={field.placeholder}
                      value={newInterest}
                      onChangeText={setNewInterest}
                      onSubmitEditing={() => addInterest(newInterest)}
                    />
                    <TouchableOpacity
                      style={styles.addTagButton}
                      onPress={() => addInterest(newInterest)}
                    >
                      <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Interest options */}
                  <Text style={styles.suggestedLabel}>Suggested interests:</Text>
                  <View style={styles.interestOptions}>
                    {interestOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.interestOption,
                          formData.interests && formData.interests.includes(option) && styles.interestOptionSelected
                        ]}
                        onPress={() => toggleInterestTag(option)}
                      >
                        <Text
                          style={[
                            styles.interestOptionText,
                            formData.interests && formData.interests.includes(option) && styles.interestOptionTextSelected
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  keyboardType={field.type === 'tel' ? 'phone-pad' : 'default'}
                  value={formData[field.key]}
                  onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
                />
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Saving...'
                : (isLastStep ? 'Complete Registration' : 'Continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#000',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
  },
  suggestedLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  customTagInput: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  addTagButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  interestOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestOptionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  interestOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#000',
  },
  interestOptionTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#000',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});