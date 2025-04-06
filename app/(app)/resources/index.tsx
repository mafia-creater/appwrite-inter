import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, BookOpen, GraduationCap, Chrome as Home, Bus, Euro, Coffee, Plus, RefreshCw } from 'lucide-react-native';
import { resourcesService } from '@/services/authService';

export default function ResourcesScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredResource, setFeaturedResource] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const router = useRouter();

  // Define the categories with their icons
  const categories = [
    {
      id: 'academic',
      title: 'Academic Life',
      icon: GraduationCap,
      color: '#FF6B6B',
    },
    {
      id: 'housing',
      title: 'Housing Guide',
      icon: Home,
      color: '#4ECDC4',
    },
    {
      id: 'transport',
      title: 'Transportation',
      icon: Bus,
      color: '#FFD93D',
    },
    {
      id: 'finance',
      title: 'Student Finance',
      icon: Euro,
      color: '#95E1D3',
    },
    {
      id: 'lifestyle',
      title: 'Student Life',
      icon: Coffee,
      color: '#FF9A8B',
    },
    // Add all other categories from your create page
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      color: '#FEF3C7',
    },
    {
      id: 'culture',
      title: 'Culture & Events',
      icon: Coffee,
      color: '#D1FAE5',
    },
    {
      id: 'health',
      title: 'Healthcare',
      icon: BookOpen,
      color: '#E0E7FF',
    },
  ];

  // Fetch all resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Whenever resources change, reorganize them by category
  useEffect(() => {
    organizeResourcesByCategory();
  }, [resources]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const data = await resourcesService.getAllResources(50, 0);
      console.log('Fetched resources:', data);
      setResources(data);
      
      // Find a featured resource (could be based on most likes, bookmarks, or designated as featured)
      const featured = data.find(r => r.featured === true) || data[0];
      setFeaturedResource(featured);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reset active category and search when refreshing
      setActiveCategory(null);
      setSearchQuery('');
      await fetchResources();
    } catch (error) {
      console.error('Failed to refresh resources:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const organizeResourcesByCategory = () => {
    // Create an object with category keys and filtered resources
    const grouped = categories.reduce((acc, category) => {
      acc[category.id] = resources.filter(resource => resource.category === category.id);
      return acc;
    }, {});
    
    setFilteredResources(grouped);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const results = await resourcesService.searchResources(text);
        setResources(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else if (text.length === 0) {
      fetchResources(); // Reset to all resources when search is cleared
    }
  };

  const handleCategoryPress = async (categoryId) => {
    try {
      setIsLoading(true);
      setActiveCategory(categoryId);
      const categoryResources = await resourcesService.getResourcesByCategory(categoryId);
      setResources(categoryResources);
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to fetch resources for category ${categoryId}:`, error);
      setIsLoading(false);
    }
  };

  const navigateToResource = (resourceId) => {
    router.push(`/resources/${resourceId}`);
  };
  
  const navigateToCreateResource = () => {
    router.push('/resources/create');
  };

  // Helper to get image URL
  const getImageUrl = (resource) => {
    // First check if resource has a direct coverImageUrl
    if (resource.coverImageUrl) {
      return resource.coverImageUrl;
    }
    
    // Then check if it has a coverImage file ID that needs to be converted
    if (resource.coverImage) {
      return resourcesService.getResourceImageUrl(resource.coverImage);
    }
    
    // Default fallback image
    return 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop';
  };

  // Format date to "X days ago"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? 'Updated today' : `Updated ${diffDays} days ago`;
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Resources</Text>
            <Text style={styles.subtitle}>Essential guides for student life</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <RefreshCw size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={navigateToCreateResource}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Categories horizontal scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContainer}
        >
          <TouchableOpacity 
            style={[
              styles.categoryFilterButton, 
              activeCategory === null && styles.activeCategoryButton
            ]}
            onPress={() => {
              setActiveCategory(null);
              fetchResources();
            }}
          >
            <Text style={[
              styles.categoryFilterText,
              activeCategory === null && styles.activeCategoryText
            ]}>All</Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryFilterButton, 
                { backgroundColor: category.color + '40' }, // Adding transparency
                activeCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <category.icon size={16} color={activeCategory === category.id ? '#fff' : category.color.replace('40', '')} />
              <Text style={[
                styles.categoryFilterText,
                activeCategory === category.id && styles.activeCategoryText
              ]}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {resources.length === 0 && !isLoading && (
          <View style={styles.emptyStateContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=400&auto=format&fit=crop'}} 
              style={styles.emptyStateImage}
            />
            <Text style={styles.emptyStateTitle}>No resources found</Text>
            <Text style={styles.emptyStateDescription}>
              {activeCategory 
                ? `There are no resources in this category yet.` 
                : searchQuery 
                  ? `We couldn't find any resources matching "${searchQuery}".`
                  : `There are no resources available yet.`
              }
            </Text>
            <TouchableOpacity 
              style={styles.createResourceButton}
              onPress={navigateToCreateResource}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.createResourceText}>Create Resource</Text>
            </TouchableOpacity>
          </View>
        )}

        {featuredResource && !activeCategory && resources.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Guide</Text>
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => navigateToResource(featuredResource.$id)}
            >
              <Image
                source={{ uri:  getImageUrl(featuredResource) }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <BookOpen size={16} color="#fff" />
                  <Text style={styles.featuredBadgeText}>Comprehensive Guide</Text>
                </View>
                <Text style={styles.featuredTitle}>{featuredResource.title}</Text>
                <Text style={styles.featuredDescription}>
                  {featuredResource.description || 'Everything you need to know for your first month as an international student'}
                </Text>
                <Text style={styles.featuredMeta}>{featuredResource.readTime || '12 min read'} • {formatDate(featuredResource.updatedAt)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* If a category is active, show only that category's resources */}
        {activeCategory && filteredResources[activeCategory] && filteredResources[activeCategory].length > 0 && (
          <View style={styles.activeCategory}>
            <Text style={styles.sectionTitle}>
              {categories.find(cat => cat.id === activeCategory)?.title || 'Resources'}
            </Text>
            <View style={styles.articlesList}>
              {filteredResources[activeCategory].map((article) => (
                <TouchableOpacity 
                  key={article.$id} 
                  style={styles.articleCardFull}
                  onPress={() => navigateToResource(article.$id)}
                >
                  {article.coverImage && (
                    <Image
                      source={{ uri: getImageUrl(article) }}
                      style={styles.articleImage}
                    />
                  )}
                  <View style={styles.articleContent}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleDescription}>{article.description}</Text>
                    <Text style={styles.articleMeta}>{article.readTime || '5 min read'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Show all categories if no specific category is selected */}
        {!activeCategory && resources.length > 0 && Object.entries(filteredResources).map(([categoryId, categoryResources]) => {
          if (categoryResources.length === 0) return null;
          
          const categoryInfo = categories.find(cat => cat.id === categoryId);
          if (!categoryInfo) return null;
          
          return (
            <View key={categoryId} style={styles.categorySection}>
              <TouchableOpacity 
                style={styles.categoryHeader}
                onPress={() => handleCategoryPress(categoryId)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}>
                  <categoryInfo.icon size={24} color="#fff" />
                </View>
                <Text style={styles.categoryTitle}>{categoryInfo.title}</Text>
              </TouchableOpacity>

              <View style={styles.articlesList}>
                {categoryResources.slice(0, 2).map((article) => (
                  <TouchableOpacity 
                    key={article.$id} 
                    style={styles.articleCard}
                    onPress={() => navigateToResource(article.$id)}
                  >
                    {article.coverImage && (
                      <Image
                        source={{ uri: getImageUrl(article.coverImage) }}
                        style={styles.articleCardImage}
                      />
                    )}
                    <View style={styles.articleContent}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <Text style={styles.articleDescription}>{article.description}</Text>
                      <Text style={styles.articleMeta}>{article.readTime || '5 min read'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {categoryResources.length > 2 && (
                <TouchableOpacity 
                  style={styles.seeMoreButton}
                  onPress={() => handleCategoryPress(categoryId)}
                >
                  <Text style={styles.seeMoreText}>See all {categoryResources.length} resources</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  featuredTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 12,
  },
  featuredMeta: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  articlesList: {
    gap: 12,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  articleCardFull: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  articleCardImage: {
    width: '100%',
    height: 160,
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  seeMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#000',
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 8,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  activeCategoryButton: {
    backgroundColor: '#000',
  },
  categoryFilterText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#fff',
  },
  activeCategory: {
    marginBottom: 32,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    padding: 20,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.7,
    borderRadius: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  createResourceButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createResourceText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginLeft: 8,
  }
});