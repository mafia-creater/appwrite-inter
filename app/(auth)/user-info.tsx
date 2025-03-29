import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

type Step = {
  id: number;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'tel' | 'select';
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
      { key: 'university', label: 'University', placeholder: 'University of Bologna', type: 'select', options: ['University of Bologna', 'Johns Hopkins SAIS Europe', 'Bologna Business School'] },
      { key: 'course', label: 'Course/Program', placeholder: 'Enter your course or program' },
    ],
  },
  {
    id: 3,
    title: 'Additional Information',
    fields: [
      { key: 'nationality', label: 'Nationality', placeholder: 'Enter your nationality' },
      { key: 'interests', label: 'Interests', placeholder: 'e.g., Sports, Music, Art', type: 'text' },
    ],
  },
];

export default function UserInfoScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // Validate current step data
    const currentStepFields = steps[currentStep].fields;
    const missingFields = currentStepFields
      .filter(field => !formData[field.key])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    if (currentStep < steps.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1);
    } else {
      // This is the final step - simulate saving profile data
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        setLoading(false);
        // Show success message
        Alert.alert(
          'Profile Completed', 
          'Your profile has been saved successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(app)') }]
        );
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

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
              {field.type === 'select' ? (
                <View style={styles.select}>
                  {field.options?.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.selectOption,
                        formData[field.key] === option && styles.selectOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, [field.key]: option })}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          formData[field.key] === option && styles.selectOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  select: {
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  selectOptionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  selectOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
  },
  selectOptionTextSelected: {
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