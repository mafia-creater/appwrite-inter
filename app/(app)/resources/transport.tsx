import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Bus, Brain as Train, MapPin, CreditCard, Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';

const transportInfo = {
  title: 'Student Transport Card',
  description: 'Get around Bologna easily with your student transport card. Access buses, trains, and more at discounted rates.',
  image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2000&auto=format&fit=crop',
  steps: [
    {
      title: 'Check Eligibility',
      description: 'Confirm you have a valid student ID and are enrolled in a participating institution.',
      icon: AlertCircle,
    },
    {
      title: 'Gather Documents',
      description: 'Prepare your student ID, proof of residence, and passport-sized photo.',
      icon: CreditCard,
    },
    {
      title: 'Visit TPER Office',
      description: 'Go to the main TPER office in Via Marconi 4 during business hours.',
      icon: MapPin,
    },
    {
      title: 'Choose Plan',
      description: 'Select between monthly, semester, or annual passes based on your needs.',
      icon: Calendar,
    },
  ],
  benefits: [
    'Unlimited travel on city buses',
    'Access to regional trains',
    'Special night service included',
    'Mobile ticket support',
  ],
  faqs: [
    {
      question: 'How much does the student transport card cost?',
      answer: 'The monthly student pass costs €27, while the annual pass is €220. There are additional discounts available based on income and age.',
    },
    {
      question: 'Where can I use my transport card?',
      answer: 'The card is valid on all TPER buses in Bologna and surrounding municipalities. It can also be used on regional trains within the metropolitan area.',
    },
    {
      question: 'How long does it take to get the card?',
      answer: 'The card is usually issued immediately at the TPER office. The whole process takes about 15-20 minutes if you have all required documents.',
    },
    {
      question: 'Can I get a replacement if I lose my card?',
      answer: 'Yes, you can get a replacement card at any TPER office. There is a €5 administrative fee, and you\'ll need to bring ID.',
    },
    {
      question: 'Is there a mobile app version?',
      answer: 'Yes, you can use the Roger app to purchase and store digital tickets. However, the student discount is only available on physical cards.',
    },
  ],
  usefulLinks: [
    {
      title: 'TPER Official Website',
      url: 'https://www.tper.it/studenti',
      description: 'Official transport authority website with detailed information',
    }
  ],
};

export default function TransportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleExternalLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transport Guide</Text>
        </View>

        <Image source={{ uri: transportInfo.image }} style={styles.coverImage} />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{transportInfo.title}</Text>
            <Text style={styles.description}>{transportInfo.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Get Your Card</Text>
            <View style={styles.steps}>
              {transportInfo.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={styles.stepIcon}>
                    <step.icon size={24} color="#1d4ed8" />
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
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsGrid}>
              {transportInfo.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  {index % 2 === 0 ? (
                    <Bus size={24} color="#1d4ed8" />
                  ) : (
                    <Train size={24} color="#1d4ed8" />
                  )}
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {transportInfo.faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedFaq === index ? (
                    <ChevronUp size={20} color="#6b7280" />
                  ) : (
                    <ChevronDown size={20} color="#6b7280" />
                  )}
                </View>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Useful Links</Text>
            {transportInfo.usefulLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.linkCard}
                onPress={() => handleExternalLink(link.url)}
              >
                <View style={styles.linkContent}>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Text style={styles.linkDescription}>{link.description}</Text>
                </View>
                <ExternalLink size={20} color="#1d4ed8" />
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#4b5563',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  steps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '45%',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1f2937',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginTop: 12,
    lineHeight: 20,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkContent: {
    flex: 1,
    marginRight: 12,
  },
  linkTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
});