import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Calendar, MapPin, Users } from 'lucide-react-native';

const events = [
  {
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
  },
  {
    id: '2',
    title: 'Italian Language Exchange',
    date: 'Sep 18, 2024',
    time: '17:30',
    location: 'Caffè Zamboni',
    image: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=600&auto=format&fit=crop',
    attendees: 42,
    description: 'Practice your Italian with native speakers in a casual environment. All levels welcome!',
    organizer: 'Language Exchange Bologna',
    category: 'Education',
  },
  {
    id: '3',
    title: 'City Walking Tour',
    date: 'Sep 20, 2024',
    time: '10:00',
    location: 'Two Towers',
    image: 'https://images.unsplash.com/photo-1605276277265-84f97980a425?q=80&w=600&auto=format&fit=crop',
    attendees: 28,
    description: 'Discover the hidden gems of Bologna with our experienced local guide. Learn about the city\'s rich history and culture.',
    organizer: 'Bologna Tourism',
    category: 'Culture',
  },
];

const { width } = Dimensions.get('window');

export default function EventsScreen() {
  const renderEventCard = ({ item }) => (
    <Link href={`/events/${item.id}`} asChild>
      <TouchableOpacity style={styles.eventCard}>
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.eventContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <Text style={styles.detailText}>{item.date} • {item.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Users size={16} color="#666" />
              <Text style={styles.detailText}>{item.attendees} attending</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Discover what's happening in Bologna</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
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
  list: {
    padding: 24,
    gap: 24,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 16,
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
  eventTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
});