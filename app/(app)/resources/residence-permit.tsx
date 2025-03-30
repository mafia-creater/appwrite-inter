import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, FileText, Calendar, MapPin, CircleAlert as AlertCircle } from 'lucide-react-native';

const faqData = [
  {
    id: 1,
    question: 'What is a Residence Permit?',
    answer: 'A residence permit (Permesso di Soggiorno) is a document that allows non-EU citizens to legally stay in Italy for periods longer than 90 days. It\'s mandatory for international students staying for more than three months.',
  },
  {
    id: 2,
    question: 'When should I apply?',
    answer: 'You must apply for your residence permit within 8 working days of arriving in Italy. The application process should be started immediately after receiving your study visa and arriving in Italy.',
  },
  {
    id: 3,
    question: 'What documents do I need?',
    answer: '• Valid passport with visa\n• 4 passport-sized photos\n• Proof of enrollment at university\n• Proof of accommodation\n• Proof of financial means\n• Health insurance coverage\n• €16 revenue stamp (marca da bollo)\n• Application fee (varies by permit duration)',
  },
  {
    id: 4,
    question: 'How long does it take?',
    answer: 'The processing time typically ranges from 30 to 90 days. You\'ll receive a receipt (ricevuta) when submitting your application, which serves as a temporary permit while waiting for the final document.',
  },
  {
    id: 5,
    question: 'Where do I submit my application?',
    answer: 'Applications are submitted at the local post office (Poste Italiane) that offers "Sportello Amico" services. You\'ll need to get a special kit from the post office or authorized offices.',
  },
];

const steps = [
  {
    id: 1,
    title: 'Get the Application Kit',
    description: 'Visit any post office and ask for the "Kit for Residence Permit". It\'s free and contains all necessary forms.',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Book an Appointment',
    description: 'Schedule an appointment at the post office for application submission.',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Visit Immigration Office',
    description: 'After submission, you\'ll get an appointment at the Immigration Office for fingerprints.',
    icon: MapPin,
  },
  {
    id: 4,
    title: 'Important Notes',
    description: 'Keep your receipt safe - it\'s your temporary permit. Check status online using the UTI number.',
    icon: AlertCircle,
  },
];

const usefulLinks = [
  {
    id: 1,
    title: 'Official Immigration Portal',
    url: 'https://www.portaleimmigrazione.it',
    description: 'Check application status and find official information',
  },
  {
    id: 2,
    title: 'Post Office Locator',
    url: 'https://www.poste.it/cerca/index.html#/vieni-in-poste',
    description: 'Find nearest post office with "Sportello Amico"',
  },
  {
    id: 3,
    title: 'University Support Office',
    url: 'https://www.unibo.it/en/services-and-opportunities/study-grants-and-subsidies/residence-permit',
    description: 'Get help from university international office',
  },
];

export default function ResidencePermitScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleLinkPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Residence Permit Guide</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Process</Text>
          <View style={styles.steps}>
            {steps.map((step) => (
              <View key={step.id} style={styles.step}>
                <View style={styles.stepIcon}>
                  <step.icon size={24} color="#E31C58" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Useful Links</Text>
          <View style={styles.links}>
            {usefulLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkCard}
                onPress={() => handleLinkPress(link.url)}
              >
                <View style={styles.linkContent}>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Text style={styles.linkDescription}>{link.description}</Text>
                </View>
                <ExternalLink size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqData.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </View>
                {expandedFaq === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    color: '#111827',
  },
  steps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
    color: '#111827',
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  links: {
    gap: 12,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
    color: '#111827',
  },
  linkDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111827',
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});