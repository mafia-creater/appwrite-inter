import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Bed, Bath, MapPin, Check, User } from 'lucide-react-native';
import { housingService } from '@/services/authService'; // Import the housing service
import ContactLandlordModal from './contact'; // Adjust the path as needed

export default function HousingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [owner, setOwner] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to load property details
  const loadPropertyDetails = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const propertyData = await housingService.getHousingListing(id);
      setProperty(propertyData);
      
      // Fetch owner profile
      if (propertyData.ownerId) {
        try {
          const ownerProfiles = await housingService.searchProfiles(propertyData.ownerId);
          if (ownerProfiles && ownerProfiles.length > 0) {
            setOwner(ownerProfiles[0]);
          }
        } catch (ownerError) {
          console.error('Failed to load owner details:', ownerError);
          // Continue without owner data
        }
      }
    } catch (error) {
      console.error('Failed to load property details:', error);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      loadPropertyDetails();
    } else {
      setError('No property ID provided');
      setIsLoading(false);
    }
  }, [id]);

  // Handle refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadPropertyDetails();
  };

  // Image navigation
  const goToNextImage = () => {
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const goToPrevImage = () => {
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      Alert.alert('Share', `Share this listing: ${property?.title}`);
      // Implement actual share functionality here
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading property details...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPropertyDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!property) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Ensure images is an array
  const images = Array.isArray(property.images) ? property.images : 
                (property.images ? [property.images] : []);

  // Get current image
  const currentImage = images.length > 0 ? 
                      images[currentImageIndex] : 
                      'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Image Gallery with navigation */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
          
          {images.length > 1 && (
            <View style={styles.imageNavigation}>
              <TouchableOpacity
                style={styles.imageNavButton}
                onPress={goToPrevImage}
              >
                <Text style={styles.imageNavButtonText}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.imageCounter}>
                {currentImageIndex + 1}/{images.length}
              </Text>
              
              <TouchableOpacity
                style={styles.imageNavButton}
                onPress={goToNextImage}
              >
                <Text style={styles.imageNavButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{property.property_type || 'Unspecified'}</Text>
          </View>

          <Text style={styles.title}>{property.title || 'Untitled Listing'}</Text>

          <View style={styles.locationRow}>
            <MapPin size={20} color="#666" />
            <Text style={styles.locationText}>{property.address || property.location || 'Location not specified'}</Text>
          </View>

          {/* Owner information */}
          {owner && (
            <View style={styles.ownerContainer}>
              <Text style={styles.ownerLabel}>Listed by:</Text>
              <View style={styles.ownerInfo}>
                {owner.avatar ? (
                  <Image source={{ uri: owner.avatar }} style={styles.ownerAvatar} />
                ) : (
                  <View style={styles.ownerAvatarFallback}>
                    <User size={20} color="#666" />
                  </View>
                )}
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{owner.fullname || 'Anonymous'}</Text>
                  {owner.university && <Text style={styles.ownerUniversity}>{owner.university}</Text>}
                </View>
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Bed size={24} color="#000" />
              <Text style={styles.statValue}>{property.bedrooms || '?'}</Text>
              <Text style={styles.statLabel}>Bedrooms</Text>
            </View>
            <View style={styles.stat}>
              <Bath size={24} color="#000" />
              <Text style={styles.statValue}>{property.bathrooms || '?'}</Text>
              <Text style={styles.statLabel}>Bathrooms</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.area || '?'}m²</Text>
              <Text style={styles.statLabel}>Area</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description || 'No description provided.'}</Text>
          </View>

          {property.amenities && property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesList}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Check size={16} color="#000" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>€{property.price || 0}</Text>
          <Text style={styles.priceUnit}>/month</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setContactModalVisible(true)} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Contact Landlord</Text>
        </TouchableOpacity>
      </View>

      <ContactLandlordModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        listingId={id.toString()}
        listingTitle={property.title}
        ownerName={owner?.fullname || 'Landlord'}
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 10,
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
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 300,
  },
  imageNavigation: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  imageNavButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  imageCounter: {
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
  },
  content: {
    padding: 24,
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    flex: 1,
  },
  ownerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ownerLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  ownerAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  ownerUniversity: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    color: '#333',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  priceUnit: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  }
});