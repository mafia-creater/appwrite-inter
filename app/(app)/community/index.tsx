import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, MessageCircle, Heart, X, Image as ImageIcon } from 'lucide-react-native';
import { postService } from '@/services/authService';
import { authService } from '@/services/authService';
import { Query } from 'appwrite'; // Make sure this import matches your setup
import { formatDistanceToNow } from 'date-fns';

export default function CommunityScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newPost, setNewPost] = useState({
    content: '',
    tags: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Get the current user and load posts
    const initialize = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        console.log('Current user:', user);
        
        // Load the user's profile
        try {
          // This will depend on how you fetch user profiles in your app
          const profile = await authService.getUserProfile(user.$id);
          setUserProfile(profile);
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Create a default profile if there's an error
          setUserProfile({
            fullname: user.name || 'User',
            avatarUrl: 'https://via.placeholder.com/100'
          });
        }
        
        await loadPosts();
      } catch (error) {
        console.error('Error initializing community screen:', error);
        Alert.alert('Error', 'Failed to load community posts');
      }
    };

    initialize();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
      console.log('Posts loaded:', fetchedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load posts');
    }
  };

  const handlePost = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }
    
    if (!newPost.content.trim()) {
      Alert.alert('Error', 'Post content cannot be empty');
      return;
    }
    
    try {
      const tagsArray = newPost.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Include user information with the post
      await postService.createPost(
        currentUser.$id,
        newPost.content.trim(),
        tagsArray,
        userProfile?.fullname || currentUser.name || 'Anonymous',
        userProfile?.avatarUrl || 'https://via.placeholder.com/100',
        userProfile?.university || 'University not specified',
        userProfile?.course || 'Program not specified'
      );
      
      // Reset form and close modal
      setNewPost({ content: '', tags: '' });
      setIsModalVisible(false);
      
      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadPosts();
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await postService.getPostsByTag(searchTerm.trim());
      setPosts(searchResults);
      setLoading(false);
    } catch (error) {
      console.error('Error searching posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to search posts');
    }
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Connect with fellow students</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor="#666"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
        </View>

        <View style={styles.posts}>
          {posts.length > 0 ? (
            posts.map((post) => {
              return (
                <Link key={post.$id} href={`/community/${post.$id}`} asChild>
                  <TouchableOpacity style={styles.post}>
                    <View style={styles.postHeader}>
                      <Image source={{ uri: post.authorAvatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
                      <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{post.authorName || 'Anonymous User'}</Text>
                        <Text style={styles.authorUniversity}>{post.authorUniversity || 'University not specified'}</Text>
                        <Text style={styles.authorProgram}>{post.authorProgram || 'Program not specified'}</Text>
                      </View>
                      <Text style={styles.timeAgo}>{formatTime(post.createdAt)}</Text>
                    </View>

                    <Text style={styles.postContent} numberOfLines={6}>{post.content}</Text>

                    <View style={styles.tags}>
                      {post.tags && post.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.action}>
                        <Heart size={20} color="#666" />
                        <Text style={styles.actionText}>{post.likes || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.action}>
                        <MessageCircle size={20} color="#666" />
                        <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No posts found</Text>
              <Text style={styles.emptyStateSubtext}>Be the first to start a discussion!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          if (currentUser) {
            setIsModalVisible(true);
          } else {
            Alert.alert('Login Required', 'You need to log in to create a post');
          }
        }}
      >
        <Text style={styles.fabText}>New Post</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>What's on your mind?</Text>
                <TextInput
                  style={styles.contentInput}
                  multiline
                  placeholder="Share your thoughts, questions, or announcements..."
                  value={newPost.content}
                  onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tags (comma separated)</Text>
                <TextInput
                  style={styles.tagsInput}
                  placeholder="e.g., Housing, Study Group, Social"
                  value={newPost.tags}
                  onChangeText={(text) => setNewPost({ ...newPost, tags: text })}
                />
              </View>

              <TouchableOpacity style={styles.imageButton}>
                <ImageIcon size={20} color="#666" />
                <Text style={styles.imageButtonText}>Add Image</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.postButton} 
              onPress={handlePost}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles stay the same as your original code
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  posts: {
    gap: 24,
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  authorUniversity: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  authorProgram: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
    color: '#333',
  },
  contentInput: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  imageButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  postButton: {
    backgroundColor: '#000',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});