import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { X, Mail, Phone, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { housingService, authService } from '@/services/authService';
import { Query } from 'react-native-appwrite';

interface ContactLandlordModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;    
  listingTitle: string;
}

export default function ContactLandlordModal({ 
  visible, 
  onClose, 
  listingId, 
  listingTitle 
}: ContactLandlordModalProps) {
  const [landlordInfo, setLandlordInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLandlordInfo = async () => {
      if (!listingId) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching listing with ID:", listingId);
        
        // Fetch the listing to get owner ID
        const listing = await housingService.getHousingListing(listingId);
        console.log("Listing data:", JSON.stringify(listing, null, 2));
        
        if (!listing) {
          throw new Error('Listing not found');
        }
        
        if (!listing.ownerId) {
          throw new Error('Listing does not have owner information');
        }
        
        const ownerId = listing.ownerId;
        console.log("Owner ID found:", ownerId);
        
        // Create a temporary user object to display at minimum
        const tempUserInfo = {
          fullname: "Property Owner",
          email: "contact@example.com",
          phone: null,
        };
        
        // Try to get the user account directly first
        try {
          // This might work if we have admin privileges
          // You may need to adjust this based on your Appwrite permissions
          const user = await authService.getCurrentUser();
          console.log("Current user:", user);
          
          if (user) {
            // Just display minimal information
            setLandlordInfo({
              fullname: "Property Owner",
              email: user.email || "contact@example.com",
              phone: null
            });
            setLoading(false);
            return;
          }
        } catch (userErr) {
          console.log("Could not get user directly:", userErr);
          // Continue to try the profile approach
        }
        
        // As a fallback, use direct database access
        // Define the database and collection IDs
        const DATABASE_ID = '67e3f0450005208dcedc';
        const PROFILES_COLLECTION_ID = '67e3f0540010aa16d205';
        
        try {
          console.log("Attempting to fetch profile from database");
          
          // The housingService itself probably doesn't have direct access to the databases object
          // So we need to create the query and pass it to a method that can execute it
          const profiles = await housingService.searchProfiles(ownerId);
    
          
          if (profiles && profiles.length > 0) {
            console.log("Profile found:", profiles[0]);
            setLandlordInfo(profiles[0]);
          } else {
            console.log("No profile found, using default information");
            // If we can't find a profile, still show something to the user
            setLandlordInfo(tempUserInfo);
          }
        } catch (profileErr) {
          console.error("Error fetching profile:", profileErr);
          // Use default info if profile fetch fails
          setLandlordInfo(tempUserInfo);
        }
      } catch (err) {
        console.error('Error in fetchLandlordInfo:', err);
        setError('Could not load landlord information. Please try again.');
        // Still provide some basic contact info
        setLandlordInfo({
          fullname: "Property Owner",
          email: "contact@example.com",
          phone: null,
        });
      } finally {
        setLoading(false);
      }
    };

    if (visible && listingId) {
      fetchLandlordInfo();
    }
  }, [visible, listingId]);

  const handleClose = () => {
    setLandlordInfo(null);
    setError(null);
    onClose();
  };

  const handleEmailPress = () => {
    if (landlordInfo?.email) {
      Linking.openURL(`mailto:${landlordInfo.email}?subject=Inquiry about: ${listingTitle}`);
    }
  };

  const handlePhonePress = () => {
    if (landlordInfo?.phone) {
      Linking.openURL(`tel:${landlordInfo.phone}`);
    }
  };

  // Handle direct contact without sending in-app message
  const handleContactNow = () => {
    if (landlordInfo?.email) {
      handleEmailPress();
    } else if (landlordInfo?.phone) {
      handlePhonePress();
    }
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
            <Text style={styles.title}>Landlord Contact Info</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle}>{listingTitle}</Text>
              <Text style={styles.listingSubtitle}>
                Contact information for the property owner
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading landlord information...</Text>
              </View>
            ) : landlordInfo ? (
              <View style={styles.landlordInfoContainer}>
                <View style={styles.landlordHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {landlordInfo.fullname?.substring(0, 1)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.landlordName}>{landlordInfo.fullname || 'Property Owner'}</Text>
                    {landlordInfo.university && (
                      <Text style={styles.landlordSubtitle}>{landlordInfo.university}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.contactItemsContainer}>
                  <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                    <Mail size={20} color="#555" />
                    <Text style={styles.contactText}>{landlordInfo.email}</Text>
                    <ExternalLink size={16} color="#999" />
                  </TouchableOpacity>

                  {landlordInfo.phone && (
                    <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                      <Phone size={20} color="#555" />
                      <Text style={styles.contactText}>{landlordInfo.phone}</Text>
                      <ExternalLink size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>How to contact</Text>
                  <Text style={styles.notesText}>
                    • Click on the email or phone to connect directly with the landlord
                  </Text>
                  <Text style={styles.notesText}>
                    • When emailing, introduce yourself and reference the property
                  </Text>
                  <Text style={styles.notesText}>
                    • Ask about availability, viewing times, and application process
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.button} onPress={handleContactNow}>
                  <Text style={styles.buttonText}>Contact Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No landlord information available</Text>
              </View>
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
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
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  landlordInfoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  landlordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  landlordName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  landlordSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  contactItemsContainer: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  notesContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notesTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
    color: '#1e40af',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#334155',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});