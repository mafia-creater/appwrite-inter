import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router';
import { Calendar, MapPin, Plus, Users, Clock } from 'lucide-react-native';
import { eventsService } from '@/services/authService';
import { format, isPast, isToday, isFuture, parseISO, addHours } from 'date-fns';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'upcoming'

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Get active events (not expired)
      const eventsData = await eventsService.getActiveEvents();
      
      // Process events to add status
      const processedEvents = eventsData.map(event => {
        const eventDate = parseISO(`${event.date}T${event.time}`);
        const eventEndTime = addHours(eventDate, 3); // Assuming events last 3 hours
        
        let status = 'upcoming';
        if (isPast(eventEndTime)) {
          status = 'ended';
        } else if (isToday(eventDate)) {
          status = 'today';
          if (isPast(eventDate) && isFuture(eventEndTime)) {
            status = 'ongoing';
          }
        }
        
        return {
          ...event,
          status,
          formattedDate: format(eventDate, 'EEE, MMM d'),
          formattedTime: format(eventDate, 'h:mm a')
        };
      });
      
      setEvents(processedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return event.status !== 'ended';
    if (filter === 'today') return event.status === 'today' || event.status === 'ongoing';
    if (filter === 'upcoming') return event.status === 'upcoming';
    return true;
  });

  const renderEventCard = ({ item }) => (
    <Link href={`/events/${item.$id}`} asChild>
      <TouchableOpacity style={styles.eventCard}>
        <Image 
          source={{ uri: item.image_url || 'https://via.placeholder.com/400x200' }} 
          style={styles.eventImage} 
        />
        {item.status === 'ongoing' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Happening Now</Text>
          </View>
        )}
        <View style={styles.eventContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <Text style={styles.detailText}>{item.formattedDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.detailText}>{item.formattedTime}</Text>
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

  // Filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
          All
        </Text>
        {filter === 'all' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterTab, filter === 'today' && styles.activeFilterTab]}
        onPress={() => setFilter('today')}
      >
        <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>
          Today
        </Text>
        {filter === 'today' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
        onPress={() => setFilter('upcoming')}
      >
        <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>
          Upcoming
        </Text>
        {filter === 'upcoming' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Discover what's happening in Bologna</Text>
        </View>
        <Link href="/events/create" asChild>
          <TouchableOpacity style={styles.plusButton}>
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        </Link>
      </View>
      
      {renderFilterTabs()}

      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#000"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No events found' : 
               filter === 'today' ? 'No events today' : 
               'No upcoming events'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchEvents}
            >
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plusButton: {
    padding: 8,
    marginRight: -8,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    marginRight: 24,
    paddingVertical: 12,
    position: 'relative',
  },
  activeFilterTab: {
    // Using minimal styling here as we'll use the indicator instead
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#777',
  },
  activeFilterText: {
    color: '#000',
    fontFamily: 'Inter_600SemiBold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 3,
  },
});
