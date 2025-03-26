import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../hooks/validators';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignIn = useCallback(async () => {
    Keyboard.dismiss(); // Hide keyboard when submitting
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // On successful login, the auth hook will handle redirection
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      if (error.code === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
        disabled={isSubmitting}
      >
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
              onSubmitEditing={handleSignIn}
              returnKeyType="go"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSignIn}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild replace>
              <TouchableOpacity disabled={isSubmitting}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    color: '#1a1a1a',
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
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    elevation: 2,
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
    color: '#1a1a1a',
  },
});