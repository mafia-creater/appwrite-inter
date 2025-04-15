import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/authContext';

// Better email validation with regex
const validateEmail = (email) => {
  // RFC 5322 standard email regex
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};

// More comprehensive password validation
const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  
  let message = '';
  if (!isValid) {
    const issues = [];
    if (!hasMinLength) issues.push('at least 8 characters');
    if (!hasUpperCase) issues.push('at least one uppercase letter');
    if (!hasLowerCase) issues.push('at least one lowercase letter');
    if (!hasNumber) issues.push('at least one number');
    
    message = `Password must contain ${issues.join(', ')}`;
  }
  
  return { isValid, message };
};

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Use the auth context
  const { signUp, authError } = useAuth();

  // Validate single field
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else {
          const validation = validatePassword(value);
          if (!validation.isValid) {
            error = validation.message;
          }
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          error = 'Passwords do not match';
        }
        break;
      case 'fullname':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Validate form on submission
  const validateForm = () => {
    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
      fullname: validateField('fullname', fullname)
    };
    
    setFormErrors(errors);
    
    // Check if there are any errors
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSignUp = async () => {
    // Validate the form
    if (!validateForm()) {
      // Don't proceed if there are validation errors
      return;
    }

    // Start loading state
    setIsSubmitting(true);
    
    try {
      const result = await signUp(email, password, fullname);
      
      if (result && result.success) {
        console.log("Sign up successful, navigating to user-info");
        router.push('/(auth)/user-info');
      }
    } catch (error) {
      // Handle specific error cases
      if (error.code === 409) {
        Alert.alert('Account Exists', 'An account with this email already exists.');
      } else if (error.code === 401 || error.message?.includes('Permission denied')) {
        Alert.alert('Authorization Error', 'Permission denied. You may need proper permissions to create an account.');
      } else {
        Alert.alert('Error', `An error occurred during sign up: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    // Update the field value
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        // Also validate confirm password when password changes
        if (confirmPassword) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: value !== confirmPassword ? 'Passwords do not match' : ''
          }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'fullname':
        setFullname(value);
        break;
      default:
        break;
    }
    
    // Clear the error for this field to be re-validated on blur
    setFormErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Validate input on blur
  const handleInputBlur = (field, value) => {
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
        disabled={isSubmitting}
      >
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our community of international students</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, formErrors.fullname ? styles.inputError : null]}
              placeholder="Enter your full name"
              value={fullname}
              onChangeText={(text) => handleInputChange('fullname', text)}
              onBlur={() => handleInputBlur('fullname', fullname)}
              editable={!isSubmitting}
            />
            {formErrors.fullname ? <Text style={styles.errorText}>{formErrors.fullname}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, formErrors.email ? styles.inputError : null]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => handleInputChange('email', text)}
              onBlur={() => handleInputBlur('email', email)}
              editable={!isSubmitting}
            />
            {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, formErrors.password ? styles.inputError : null]}
              placeholder="Choose a password"
              secureTextEntry
              value={password}
              onChangeText={(text) => handleInputChange('password', text)}
              onBlur={() => handleInputBlur('password', password)}
              editable={!isSubmitting}
            />
            {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, formErrors.confirmPassword ? styles.inputError : null]}
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              onBlur={() => handleInputBlur('confirmPassword', confirmPassword)}
              editable={!isSubmitting}
            />
            {formErrors.confirmPassword ? <Text style={styles.errorText}>{formErrors.confirmPassword}</Text> : null}
          </View>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity disabled={isSubmitting}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 32,
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
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  terms: {
    marginTop: 8,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#000',
    fontFamily: 'Inter_600SemiBold',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  footerLink: {
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
});