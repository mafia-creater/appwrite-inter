import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Bed, Bath, Euro, MapPin, Plus } from 'lucide-react-native';

const housing = [
  {
    id: '1',
    title: 'Modern Studio near University',
    location: 'Via Zamboni',
    price: 650,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    available: 'Immediately',
    furnished: true,
  },
  {
    id: '2',
    title: 'Shared Apartment in City Center',
    location: 'Piazza Maggiore',
    price: 450,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop',
    type: 'Shared',
    bedrooms: 3,
    bathrooms: 2,
    area: 90,
    available: 'Oct 1, 2024',
    furnished: true,
  },
  {
    id: '3',
    title: 'Cozy Room in Student House',
    location: 'Via San Vitale',
    price: 380,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop',
    type: 'Room',
    bedrooms: 1,
    bathrooms: 2,
    area: 15,
    available: 'Sep 15, 2024',
    furnished: true,
  },
];

export default function ExploreScreen() {
  const renderHousingCard = ({ item }) => (
    <Link href={`/explore/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          
          <Text style={styles.cardTitle}>{item.title}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={16} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Bed size={16} color="#666" />
              <Text style={styles.detailText}>{item.bedrooms} bed</Text>
            </View>
            <View style={styles.detail}>
              <Bath size={16} color="#666" />
              <Text style={styles.detailText}>{item.bathrooms} bath</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailText}>{item.area}m²</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>€{item.price}</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

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
        />
      </View>

      <FlatList
        data={housing}
        renderItem={renderHousingCard}
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
  },
  cardImage: {
    width: '100%',
    height: 200,
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
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
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