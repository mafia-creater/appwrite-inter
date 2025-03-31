import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Send } from 'lucide-react-native';

interface ContactLandlordModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export function ContactLandlordModal() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
  };

  const handleClose = () => {
    setMessage('');
    setError(null);
    setSent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Contact Landlord</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {sent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Message Sent!</Text>
                <Text style={styles.successText}>
                  The landlord will get back to you soon. You'll receive a notification when they respond.
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleClose}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listingTitle}</Text>
                  <Text style={styles.listingSubtitle}>
                    Send a message to the landlord about this property
                  </Text>
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.form}>
                  <Text style={styles.label}>Your Message</Text>
                  <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    placeholder="Introduce yourself and ask any questions you have about the property..."
                    value={message}
                    onChangeText={setMessage}
                    textAlignVertical="top"
                  />

                  <View style={styles.suggestions}>
                    <Text style={styles.suggestionsTitle}>Suggested Questions:</Text>
                    <TouchableOpacity
                      onPress={() => setMessage(prev => 
                        `${prev}\n\nIs the property still available?`
                      )}
                    >
                      <Text style={styles.suggestion}>• Is the property still available?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMessage(prev => 
                        `${prev}\n\nWhen can I schedule a viewing?`
                      )}
                    >
                      <Text style={styles.suggestion}>• When can I schedule a viewing?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMessage(prev => 
                        `${prev}\n\nAre utilities included in the rent?`
                      )}
                    >
                      <Text style={styles.suggestion}>• Are utilities included in the rent?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMessage(prev => 
                        `${prev}\n\nWhat's the minimum lease duration?`
                      )}
                    >
                      <Text style={styles.suggestion}>• What's the minimum lease duration?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={sending}
                >
                  <Send size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  listingInfo: {
    marginBottom: 24,
  },
  listingTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  listingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    minHeight: 120,
  },
  suggestions: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    paddingVertical: 4,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  sendButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});