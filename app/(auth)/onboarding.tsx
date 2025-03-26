import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.image}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Bologna</Text>
        <Text style={styles.subtitle}>
          Your guide to student life in the heart of Italy
        </Text>
        <View style={styles.buttonContainer}>
          <Link href="/sign-in" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </Link>
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
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    marginBottom: 32,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});