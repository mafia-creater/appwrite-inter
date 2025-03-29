import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, MapPin, Users, Share2 } from 'lucide-react-native';

const events = {
  '1': {
    id: '1',
    title: 'International Students Welcome Party',
    date: 'Sep 15, 2024',
    time: '18:00',
    location: 'Piazza Maggiore',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
    attendees: 156,
    description: 'Join us for a night of music, food, and cultural exchange! Meet fellow international students and start your Bologna adventure.',
    organizer: 'Student Union Bologna',
    category: 'Social',
    fullDescription: `Get ready for the biggest international student event of the year! This welcome party is designed to help you meet fellow students from around the world and kick off your academic journey in Bologna in style.

What to expect:
• Live music from local bands
• International food stations
• Cultural performances
• Ice-breaking activities
• City information booth
• Student organizations showcase

Don't miss this opportunity to make friends from across the globe and become part of Bologna's vibrant student community!`,
    address: 'Piazza Maggiore, 40124 Bologna BO, Italy',
    price: 'Free',
  },
  // Add other events here...
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const event = events[id as string];

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Event not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: event.image }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailText}>{event.date} • {event.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailText}>{event.address}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Users size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailText}>{event.attendees} people attending</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.fullDescription}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <Text style={styles.organizerText}>{event.organizer}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{event.price}</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Join Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  shareButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 24,
  },
  categoryBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    color: '#333',
  },
  organizerText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#333',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
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