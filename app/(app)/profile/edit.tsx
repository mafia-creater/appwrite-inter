import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Camera, MapPin, School, Mail, Phone, Save } from 'lucide-react-native';

export default function EditProfileScreen() {
  const [formData, setFormData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@studio.unibo.it',
    phone: '+39 123 456 7890',
    university: 'University of Bologna',
    program: 'Masters in International Relations',
    location: 'Bologna, Italy',
    bio: 'International student passionate about global politics and cultural exchange. Always up for a coffee and a good conversation! 🌍✨',
    interests: 'Politics, Travel, Photography, Languages',
    notifications: {
      events: true,
      messages: true,
      updates: false,
    },
  });

  const handleSave = () => {
    // Handle save logic here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Camera size={20} color="#666" />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.iconInput}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>University</Text>
              <View style={styles.iconInput}>
                <School size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.university}
                  onChangeText={(text) => setFormData({ ...formData, university: text })}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Program</Text>
              <View style={styles.iconInput}>
                <School size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.program}
                  onChangeText={(text) => setFormData({ ...formData, program: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.iconInput}>
                <Mail size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.email}
                  keyboardType="email-address"
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.iconInput}>
                <Phone size={20} color="#666" />
                <TextInput
                  style={styles.iconTextInput}
                  value={formData.phone}
                  keyboardType="phone-pad"
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Add your interests (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.interests}
                onChangeText={(text) => setFormData({ ...formData, interests: text })}
                placeholder="e.g., Politics, Travel, Photography"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Event Updates</Text>
                <Text style={styles.switchDescription}>Get notified about new events</Text>
              </View>
              <Switch
                value={formData.notifications.events}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, events: value },
                  })
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Messages</Text>
                <Text style={styles.switchDescription}>Receive message notifications</Text>
              </View>
              <Switch
                value={formData.notifications.messages}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, messages: value },
                  })
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>App Updates</Text>
                <Text style={styles.switchDescription}>Stay informed about app changes</Text>
              </View>
              <Switch
                value={formData.notifications.updates}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, updates: value },
                  })
                }
              />
            </View>
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  form: {
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
});