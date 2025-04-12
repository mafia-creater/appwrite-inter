import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Bed, Bath, MapPin, Plus, User } from 'lucide-react-native';
import { housingService } from '@/services/authService'; // Import the housing service

export default function ExploreScreen() {
  const [housing, setHousing] = useState([]);
  const [filteredHousing, setFilteredHousing] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [owners, setOwners] = useState({});  // Add state to store owner info

  // Function to load housing listings
  const loadHousingListings = useCallback(async () => {
    try {
      setError(null);
      const listings = await housingService.getHousingListings();
      
      // Create an object to store unique owner IDs
      const ownerIds = new Set();
      listings.forEach(listing => {
        if (listing.ownerId) {
          ownerIds.add(listing.ownerId);
        }
      });
      
      // Fetch owner profiles for all listings
      const ownersData = {};
      for (const ownerId of ownerIds) {
        try {
          const ownerProfile = await housingService.searchProfiles(ownerId);
          if (ownerProfile && ownerProfile.length > 0) {
            ownersData[ownerId] = ownerProfile[0];
          }
        } catch (err) {
          console.error(`Failed to fetch owner profile for ${ownerId}:`, err);
        }
      }
      
      setOwners(ownersData);
      setHousing(listings);
      setFilteredHousing(listings);
    } catch (error) {
      console.error('Failed to load housing listings:', error);
      setError('Failed to load housing listings. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHousingListings();
  }, [loadHousingListings]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadHousingListings();
  }, [loadHousingListings]);

  // Handle search
  const handleSearch = async (text) => {
    setSearchTerm(text);
    
    if (!text.trim()) {
      // If search is empty, restore full list
      setFilteredHousing(housing);
      return;
    }
    
    try {
      const results = await housingService.searchHousingListings(text);
      setFilteredHousing(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Fall back to client-side filtering if search API fails
      const filtered = housing.filter(item => 
        item.title?.toLowerCase().includes(text.toLowerCase()) ||
        item.location?.toLowerCase().includes(text.toLowerCase()) ||
        item.type?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredHousing(filtered);
    }
  };

  // Get secure image URL with fallback
  const getSecureImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/600x400?text=No+Image';
    
    // Handle possible array
    if (Array.isArray(url)) {
      return url.length > 0 ? url[0] : 'https://via.placeholder.com/600x400?text=No+Image';
    }
    
    // Ensure URL uses HTTPS
    return url.replace(/^http:\/\//i, 'https://');
  };

  const renderHousingCard = ({ item }) => {
    // Get owner info
    const owner = owners[item.ownerId] || {};
    const ownerName = owner.fullname || 'Anonymous';
    const ownerAvatar = owner.avatar || null;
    
    return (
      <Link href={`/explore/${item.$id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <Image 
            source={{ uri: getSecureImageUrl(item.images) }} 
            style={styles.cardImage}
            defaultSource={require('@/assets/images/placeholder.png')} // Add a default image asset
          />
          <View style={styles.cardContent}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.property_type || 'Unspecified'}</Text>
            </View>
            
            <Text style={styles.cardTitle}>{item.title || 'Untitled Listing'}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location || 'Location not specified'}
              </Text>
            </View>

            {/* Owner info row */}
            <View style={styles.ownerRow}>
              {ownerAvatar ? (
                <Image source={{ uri: ownerAvatar }} style={styles.ownerAvatar} />
              ) : (
                <View style={styles.ownerAvatarFallback}>
                  <User size={14} color="#666" />
                </View>
              )}
              <Text style={styles.ownerName} numberOfLines={1}>
                {ownerName}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detail}>
                <Bed size={16} color="#666" />
                <Text style={styles.detailText}>{item.bedrooms || '?'} bed</Text>
              </View>
              <View style={styles.detail}>
                <Bath size={16} color="#666" />
                <Text style={styles.detailText}>{item.bathrooms || '?'} bath</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailText}>{item.area || '?'}m²</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>€{item.price || 0}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading housing listings...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHousingListings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Housing</Text>
        <Text style={styles.subtitle}>Find your perfect student accommodation</Text>
        <Link href="/explore/create" asChild>
          <TouchableOpacity style={styles.plusButton}>
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location or type..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredHousing}
        renderItem={renderHousingCard}
        keyExtractor={item => item.$id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No housing listings found matching your search.' : 'No housing listings available.'}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 24,
  },
  plusButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 50,
    padding: 12,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 24,
    marginTop: 0,
    borderRadius: 12,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  list: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  typeBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    flex: 1,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  ownerAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  priceUnit: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginLeft: 4,
  },
});