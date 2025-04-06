import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ArrowLeft, Clock, Calendar, ThumbsUp, MessageCircle, Bookmark, Share2, ChevronRight, Heart } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchResourceData();
  }, [id]);

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      
      // Fetch the requested resource
      const resourceData = await resourcesService.getResourceById(id);
      setResource(resourceData);
      
      // Fetch related resources from the same category
      if (resourceData.category) {
        const related = await resourcesService.getResourcesByCategory(
          resourceData.category, 
          2, // Limit to 2 related items
          0, // No offset
        );
        
        // Filter out the current resource
        setRelatedResources(related.filter(item => item.$id !== id));
      }
      
      // Check if current user has liked or bookmarked this resource
      if (user) {
        // These would be actual API calls in a real implementation
        // You'd need to add these methods to your service
        // const likeStatus = await resourcesService.checkUserLikeStatus(id, user.$id);
        // const bookmarkStatus = await resourcesService.checkUserBookmarkStatus(id, user.$id);
        
        setUserActions({
          hasLiked: false, // Replace with actual API response
          hasBookmarked: false // Replace with actual API response
        });
      }
      
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push('/auth/login?returnTo=' + encodeURIComponent(`/resources/${id}`));
      return;
    }
    
    try {
      await resourcesService.likeResource(id);
      
      // Update local state
      setResource(prev => ({
        ...prev,
        likes: (prev.likes || 0) + 1
      }));
      
      setUserActions(prev => ({
        ...prev,
        hasLiked: true
      }));
    } catch (err) {
      console.error('Error liking resource:', err);
      Alert.alert('Error', 'Unable to like this resource. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push('/auth/login?returnTo=' + encodeURIComponent(`/resources/${id}`));
      return;
    }
    
    try {
      await resourcesService.bookmarkResource(id, user.$id);
      
      // Update local state
      setResource(prev => ({
        ...prev,
        bookmarks: (prev.bookmarks || 0) + 1
      }));
      
      setUserActions(prev => ({
        ...prev,
        hasBookmarked: true
      }));
    } catch (err) {
      console.error('Error bookmarking resource:', err);
      Alert.alert('Error', 'Unable to bookmark this resource. Please try again.');
    }
  };

  const handleShare = () => {
    // Implement share functionality
    // This would use the Share API in a real app
    Alert.alert('Share', 'Share functionality would be implemented here.');
  };

  const handleCommentPress = () => {
    // Navigate to comments screen
    router.push(`/resources/${id}/comments`);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading resource...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Resource not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  getCoverImageUrl = () => {
    // If it's already a complete URL
    if (resource.coverImageUrl && resource.coverImageUrl.startsWith('http')) {
      return resource.coverImageUrl;
    }
    // If it's a file ID
    else if (resource.coverImage) {
      return resourcesService.getResourceImageUrl(resource.coverImage);
    }
    return null;
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, userActions.hasBookmarked && styles.activeActionButton]} 
              onPress={handleBookmark}
            >
              <Bookmark size={24} color={userActions.hasBookmarked ? "#3366FF" : "#000"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {resource.coverImageUrl && (
          <Image 
            source={{ uri: getCoverImageUrl() }} 
            style={[styles.coverImage, { width }]} 
            resizeMode="cover"
          />
        )}

        <View style={styles.articleContent}>
          <View style={styles.breadcrumbs}>
            <Text style={styles.breadcrumbText}>Resources</Text>
            <ChevronRight size={16} color="#666" />
            <Text style={styles.breadcrumbText}>{resource.category || 'Uncategorized'}</Text>
          </View>

          <Text style={styles.title}>{resource.title}</Text>

          <View style={styles.authorRow}>
            {resource.author?.avatar && (
              <Image source={{ uri: resource.author.avatar }} style={styles.authorAvatar} />
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
            <Markdown style={markdownStyles}>
              {resource.content}
            </Markdown>
          </View>

          {relatedResources.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related Resources</Text>
              <View style={styles.relatedArticles}>
                {relatedResources.map((related) => (
                  <TouchableOpacity
                    key={related.$id}
                    style={styles.relatedArticle}
                    onPress={() => router.push(`/resources/${related.$id}`)}
                  >
                    {related.coverImage && (
                      <Image 
                        source={{ uri: resourcesService.getResourceImageUrl(related.coverImage) }} 
                        style={styles.relatedImage} 
                      />
                    )}
                    <View style={styles.relatedContent}>
                      <View style={styles.relatedCategory}>
                        <Text style={styles.relatedCategoryText}>{related.category || 'Uncategorized'}</Text>
                      </View>
                      <Text style={styles.relatedArticleTitle}>{related.title}</Text>
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
        >
          <ThumbsUp size={20} color={userActions.hasLiked ? "#3366FF" : "#666"} />
          <Text style={[styles.footerButtonText, userActions.hasLiked && styles.activeFooterButtonText]}>
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleCommentPress}>
          <MessageCircle size={20} color="#666" />
          <Text style={styles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, userActions.hasBookmarked && styles.activeFooterButton]} 
          onPress={handleBookmark}
        >
          <Bookmark size={20} color={userActions.hasBookmarked ? "#3366FF" : "#666"} />
          <Text style={[styles.footerButtonText, userActions.hasBookmarked && styles.activeFooterButtonText]}>
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleShare}>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
  activeActionButton: {
    backgroundColor: '#f0f5ff',
  },
  coverImage: {
    height: 300,
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
  },
  relatedImage: {
    width: 120,
    height: 120,
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
    color: '#666',
  },
  relatedArticleTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  activeFooterButton: {
    backgroundColor: '#f0f5ff',
    borderRadius: 8,
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  activeFooterButtonText: {
    color: '#3366FF',
  },
});