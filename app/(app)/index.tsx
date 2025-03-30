import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { eventsService } from '@/services/authService';

const quickActions = [
  {
    id: 1,
    title: 'Find Housing',
    description: 'Browse verified listings',
    color: '#FEF3C7',
    textColor: '#92400E',
    route: '/explore'
  },
  {
    id: 2,
    title: 'Transport Card',  
    description: 'Get your student pass',
    color: '#DBEAFE',
    textColor: '#1E40AF',
    route: '/resources/transport'
  },
  {
    id: 3,
    title: 'Residence Permit',
    description: 'Step-by-step guide',
    color: '#FCE7F3',
    textColor: '#831843',
    route: '/resources/residence-permit'
  },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await eventsService.getEvents();
        // Sort events by date and take only the upcoming ones
        const sortedEvents = events
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3); // Take only the first 3 upcoming events
          
        setUpcomingEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleQuickActionPress = (route) => {
    router.push(route);
  };

  const handleEventPress = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  const navigateToAllEvents = () => {
    router.push('/events');
  };

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{profile?.fullname || 'User'}</Text>
          </View>
          <Pressable style={styles.iconButton}>
            <Bell size={24} color="#1F2937" />
          </Pressable>
        </View>

        <Pressable 
          style={styles.searchBar}
          onPress={() => router.push('/explore')}
        >
          <Search size={20} color="#6B7280" />
          <Text style={styles.searchText}>Search for resources, events...</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={[styles.quickAction, { backgroundColor: action.color }]}
                onPress={() => handleQuickActionPress(action.route)}
              >
                <Text style={[styles.quickActionTitle, { color: action.textColor }]}>
                  {action.title}
                </Text>
                <Text style={[styles.quickActionDescription, { color: action.textColor }]}>
                  {action.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Pressable 
              style={styles.seeAll}
              onPress={navigateToAllEvents}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color="#E31C58" />
            </Pressable>
          </View>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading events...</Text>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Pressable 
                key={event.$id} 
                style={styles.eventCard}
                onPress={() => handleEventPress(event.$id)}
              >
                <Image 
                  source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400' }} 
                  style={styles.eventImage} 
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={styles.noEventsText}>No upcoming events</Text>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1F2937',
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  quickActions: {
    gap: 12,
    marginTop: 16,
  },
  quickAction: {
    padding: 16,
    borderRadius: 12,
  },
  quickActionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    opacity: 0.8,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#E31C58',
    marginRight: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: 100,
    height: 100,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  eventDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E31C58',
    marginBottom: 4,
  },
  eventLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});