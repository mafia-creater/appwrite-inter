import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  Share,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  ThumbsUp, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ChevronRight,
  AlertCircle
} from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { resourcesService } from '@/services/authService';
import { useAuth } from '@/context/authContext';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [userActions, setUserActions] = useState({
    hasLiked: false,
    hasBookmarked: false
  });
  const [imageError, setImageError] = useState(false);
  
  // Animation for like button
  const likeScale = useRef(new Animated.Value(1)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  
  // Keep track of component mount state to prevent memory leaks
  const isMounted = useRef(true);

  // Handle image URL generation with proper error handling
  const getCoverImageUrl = useCallback(() => {
    if (!resource) return null;
    
    try {
      // If it's already a complete URL
      if (resource.coverImageUrl && typeof resource.coverImageUrl === 'string' && 
          resource.coverImageUrl.startsWith('http')) {
        return resource.coverImageUrl;
      }
      // If it's a file ID
      else if (resource.coverImage && typeof resource.coverImage === 'string') {
        return resourcesService.getResourceImageUrl(resource.coverImage);
      }
    } catch (err) {
      console.error('Error generating image URL:', err);
    }
    
    // Fallback image
    return 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop';
  }, [resource]);

  // Format date string with error handling
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently updated';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently updated'; // Invalid date check
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Recently updated';
    }
  }, []);

  const fetchResourceData = useCallback(async () => {
    if (!id) {
      setError('Resource ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the requested resource
      const resourceData = await resourcesService.getResourceById(id);
      
      if (!isMounted.current) return;
      
      if (!resourceData) {
        setError('Resource not found');
        setLoading(false);
        return;
      }
      
      setResource(resourceData);
      setImageError(false);
      
      // Fetch related resources from the same category
      if (resourceData.category) {
        try {
          const related = await resourcesService.getResourcesByCategory(
            resourceData.category, 
            3, // Increased to 3 to ensure we have alternatives if current resource is filtered out
            0
          );
          
          if (!isMounted.current) return;
          
          // Filter out the current resource
          setRelatedResources(related.filter(item => item.$id !== id).slice(0, 2));
        } catch (relatedErr) {
          console.error('Error fetching related resources:', relatedErr);
          // Don't set main error, just log it since related resources are not critical
        }
      }
      
      // Check if current user has liked or bookmarked this resource
      if (user) {
        try {
          // These would be actual API calls in a real implementation
          // const likeStatus = await resourcesService.checkUserLikeStatus(id, user.$id);
          // const bookmarkStatus = await resourcesService.checkUserBookmarkStatus(id, user.$id);
          
          if (!isMounted.current) return;
          
          setUserActions({
            hasLiked: false, // Replace with actual API response
            hasBookmarked: false // Replace with actual API response
          });
        } catch (userActionErr) {
          console.error('Error fetching user action status:', userActionErr);
          // Don't set main error for this non-critical feature
        }
      }
      
    } catch (err) {
      console.error('Error fetching resource:', err);
      
      if (!isMounted.current) return;
      
      setError(err.message || 'Failed to load resource. Please try again later.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, user]);

  // Set up effect for data fetching
  useEffect(() => {
    isMounted.current = true;
    fetchResourceData();
    
    return () => {
      isMounted.current = false;
    };
  }, [id, fetchResourceData]);

  // Animation helpers
  const animateScale = useCallback((animatedValue) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleLike = useCallback(async () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push('/auth/login?returnTo=' + encodeURIComponent(`/resources/${id}`));
      return;
    }
    
    if (userActions.hasLiked) {
      // User already liked this resource
      return;
    }
    
    try {
      // Optimistic update
      animateScale(likeScale);
      setUserActions(prev => ({
        ...prev,
        hasLiked: true
      }));
      
      setResource(prev => ({
        ...prev,
        likes: (prev.likes || 0) + 1
      }));
      
      // Perform the actual API call
      await resourcesService.likeResource(id);
    } catch (err) {
      console.error('Error liking resource:', err);
      
      // Revert the optimistic update if failed
      setUserActions(prev => ({
        ...prev,
        hasLiked: false
      }));
      
      setResource(prev => ({
        ...prev,
        likes: Math.max((prev.likes || 0) - 1, 0)
      }));
      
      Alert.alert('Error', 'Unable to like this resource. Please try again.');
    }
  }, [id, user, userActions.hasLiked, animateScale, likeScale]);

  const handleBookmark = useCallback(async () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push('/auth/login?returnTo=' + encodeURIComponent(`/resources/${id}`));
      return;
    }
    
    if (userActions.hasBookmarked) {
      // User already bookmarked this resource
      return;
    }
    
    try {
      // Optimistic update
      animateScale(bookmarkScale);
      setUserActions(prev => ({
        ...prev,
        hasBookmarked: true
      }));
      
      setResource(prev => ({
        ...prev,
        bookmarks: (prev.bookmarks || 0) + 1
      }));
      
      // Perform the actual API call
      await resourcesService.bookmarkResource(id, user.$id);
    } catch (err) {
      console.error('Error bookmarking resource:', err);
      
      // Revert the optimistic update if failed
      setUserActions(prev => ({
        ...prev,
        hasBookmarked: false
      }));
      
      setResource(prev => ({
        ...prev,
        bookmarks: Math.max((prev.bookmarks || 0) - 1, 0)
      }));
      
      Alert.alert('Error', 'Unable to bookmark this resource. Please try again.');
    }
  }, [id, user, userActions.hasBookmarked, animateScale, bookmarkScale]);

  const handleShare = useCallback(async () => {
    if (!resource) return;
    
    try {
      const result = await Share.share({
        title: resource.title,
        message: `Check out this resource: ${resource.title}\n\n${resource.description || ''}`,
        // url: In a real app, you would include a deep link URL
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with:', result.activityType);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      Alert.alert('Error', 'Unable to share this resource. Please try again.');
    }
  }, [resource]);

  const handleCommentPress = useCallback(() => {
    // Navigate to comments screen
    if (id) {
      router.push(`/resources/${id}/comments`);
    }
  }, [id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchResourceData();
  }, [fetchResourceData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#3366FF" />
        <Text style={styles.loadingText}>Loading resource...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <AlertCircle size={48} color="#ff3b30" />
        <Text style={styles.errorText}>{error || 'Resource not found'}</Text>
        <TouchableOpacity 
          style={styles.errorButton} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollView"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, userActions.hasBookmarked && styles.activeActionButton]} 
              onPress={handleBookmark}
              accessibilityRole="button"
              accessibilityLabel={userActions.hasBookmarked ? "Bookmarked" : "Bookmark this resource"}
            >
              <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                <Bookmark size={24} color={userActions.hasBookmarked ? "#3366FF" : "#000"} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share this resource"
            >
              <Share2 size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {!imageError && (
          <Image 
            source={{ uri: getCoverImageUrl() }} 
            style={[styles.coverImage, { width }]} 
            resizeMode="cover"
            accessibilityLabel={`Cover image for ${resource.title}`}
            onError={handleImageError}
          />
        )}

        <View style={styles.articleContent}>
          <View style={styles.breadcrumbs}>
            <TouchableOpacity 
              onPress={() => router.push('/resources')}
              accessibilityRole="button"
              accessibilityLabel="Go to all resources"
            >
              <Text style={styles.breadcrumbText}>Resources</Text>
            </TouchableOpacity>
            <ChevronRight size={16} color="#666" />
            <TouchableOpacity 
              onPress={() => router.push(`/resources?category=${resource.category}`)}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${resource.category || 'Uncategorized'} category`}
            >
              <Text style={styles.breadcrumbText}>{resource.category || 'Uncategorized'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title} accessibilityRole="header">{resource.title}</Text>

          <View style={styles.authorRow}>
            {resource.author?.avatar && (
              <Image 
                source={{ uri: resource.author.avatar }} 
                style={styles.authorAvatar} 
                accessibilityLabel={`Avatar for ${resource.author?.name || 'Anonymous'}`}
                onError={() => {}} // Silent fail for author avatar
              />
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{resource.author?.name || 'Anonymous'}</Text>
              <View style={styles.articleMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.metaText}>{formatDate(resource.createdAt)}</Text>
                </View>
                {resource.readTime && (
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.metaText}>{resource.readTime}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <ThumbsUp size={16} color={userActions.hasLiked ? "#3366FF" : "#666"} />
              <Text style={styles.statText}>{resource.likes || 0} likes</Text>
            </View>
            <View style={styles.stat}>
              <MessageCircle size={16} color="#666" />
              <Text style={styles.statText}>{resource.comments || 0} comments</Text>
            </View>
            <View style={styles.stat}>
              <Bookmark size={16} color={userActions.hasBookmarked ? "#3366FF" : "#666"} />
              <Text style={styles.statText}>{resource.bookmarks || 0} bookmarks</Text>
            </View>
          </View>

          <View style={styles.contentWrapper}>
            {resource.content ? (
              <Markdown style={markdownStyles}>
                {resource.content}
              </Markdown>
            ) : (
              <Text style={styles.noContentText}>
                This resource has no content yet. Please check back later.
              </Text>
            )}
          </View>

          {relatedResources.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related Resources</Text>
              <View style={styles.relatedArticles}>
                {relatedResources.map((related) => (
                  <TouchableOpacity
                    key={related.$id}
                    style={styles.relatedArticle}
                    onPress={() => {
                      // Clear current state before navigating to avoid stale data
                      setResource(null);
                      setLoading(true);
                      router.push(`/resources/${related.$id}`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Read related resource: ${related.title}`}
                  >
                    <Image 
                      source={{ 
                        uri: related.coverImage 
                          ? resourcesService.getResourceImageUrl(related.coverImage) 
                          : related.coverImageUrl || 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop'
                      }} 
                      style={styles.relatedImage}
                      accessibilityLabel={`Cover image for ${related.title}`}
                      onError={() => {}} // Silent fail
                    />
                    <View style={styles.relatedContent}>
                      <View style={styles.relatedCategory}>
                        <Text style={styles.relatedCategoryText}>{related.category || 'Uncategorized'}</Text>
                      </View>
                      <Text style={styles.relatedArticleTitle} numberOfLines={2}>{related.title}</Text>
                      <Text style={styles.readMore}>Read More</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.footerButton, userActions.hasLiked && styles.activeFooterButton]} 
          onPress={handleLike}
          accessibilityRole="button"
          accessibilityLabel={userActions.hasLiked ? "Liked" : "Like this resource"}
        >
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <ThumbsUp size={20} color={userActions.hasLiked ? "#3366FF" : "#666"} />
          </Animated.View>
          <Text style={[styles.footerButtonText, userActions.hasLiked && styles.activeFooterButtonText]}>
            {userActions.hasLiked ? "Liked" : "Like"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={handleCommentPress}
          accessibilityRole="button"
          accessibilityLabel="View or add comments"
        >
          <MessageCircle size={20} color="#666" />
          <Text style={styles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, userActions.hasBookmarked && styles.activeFooterButton]} 
          onPress={handleBookmark}
          accessibilityRole="button"
          accessibilityLabel={userActions.hasBookmarked ? "Saved" : "Save this resource"}
        >
          <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
            <Bookmark size={20} color={userActions.hasBookmarked ? "#3366FF" : "#666"} />
          </Animated.View>
          <Text style={[styles.footerButtonText, userActions.hasBookmarked && styles.activeFooterButtonText]}>
            {userActions.hasBookmarked ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share this resource"
        >
          <Share2 size={20} color="#666" />
          <Text style={styles.footerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  heading1: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginTop: 32,
    marginBottom: 16,
    color: '#000',
  },
  heading2: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 24,
    marginBottom: 12,
    color: '#000',
  },
  heading3: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 24,
  },
  list_item: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  strong: {
    fontFamily: 'Inter_600SemiBold',
  },
  link: {
    color: '#3366FF',
    textDecorationLine: 'underline',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#eee',
    paddingLeft: 16,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 16,
    marginBottom: 16,
  },
  code_inline: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  code_block: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  hr: {
    backgroundColor: '#eee',
    height: 1,
    marginTop: 24,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
  },
  thead: {
    backgroundColor: '#f9f9f9',
  },
  th: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontFamily: 'Inter_600SemiBold',
  },
  td: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
};

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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  errorButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter_600SemiBold',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3366FF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  activeActionButton: {
    backgroundColor: '#f0f5ff',
  },
  coverImage: {
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  articleContent: {
    padding: 24,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumbText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    lineHeight: 40,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  contentWrapper: {
    marginBottom: 32,
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  relatedSection: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  relatedTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  relatedArticles: {
    gap: 16,
  },
  relatedArticle: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  relatedImage: {
    width: 120,
    height: 120,
    backgroundColor: '#eee',
  },
  relatedContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  relatedCategory: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  relatedCategoryText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#3366FF',
  },
  relatedArticleTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    color: '#3366FF',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeFooterButton: {
    backgroundColor: '#f0f5ff',
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  activeFooterButtonText: {
    color: '#3366FF',
  },
  // Transition animations
  fadeIn: {
    opacity: 1,
    transition: { duration: 300 },
  },
  fadeOut: {
    opacity: 0,
  },
  // Enhanced accessibility styles
  accessibilityFocus: {
    borderWidth: 2,
    borderColor: '#3366FF',
    borderRadius: 8,
  },
  // Additional interaction states
  touchableHighlight: {
    backgroundColor: '#f0f5ff',
  },
  // Enhanced typography for better readability
  captionText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#999',
    marginTop: 4,
  },
  // Support for dark mode (would be applied conditionally)
  darkModeText: {
    color: '#f5f5f5',
  },
  darkModeBackground: {
    backgroundColor: '#121212',
  },
  darkModeBorder: {
    borderColor: '#333',
  },
  // Additional image states
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageError: {
    backgroundColor: '#fff5f5',
  },
  // Animation states
  pulse: {
    opacity: 0.7,
  },
  // Additional layout elements
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 24,
  },
  tag: {
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#3366FF',
  },
  // Enhanced button states
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimary: {
    backgroundColor: '#3366FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonSecondaryText: {
    color: '#333',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  // Additional content elements
  codeBlock: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3366FF',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  }
});