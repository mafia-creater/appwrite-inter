import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Send, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { postService } from '@/services/authService';
import { authService } from '@/services/authService';
import { formatDistanceToNow } from 'date-fns';
import { Query } from 'react-native-appwrite';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        await loadPost();
      } catch (error) {
        console.error('Error initializing post detail screen:', error);
        Alert.alert('Error', 'Failed to load post details');
      }
    };

    initialize();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // Fetch the post
      const fetchedPost = await postService.getPost(id);
      setPost(fetchedPost);
      
      // Fetch comments
      const fetchedComments = await postService.getComments(id);
      setComments(fetchedComments);
      
      // Collect all user IDs (post author + comment authors)
      const userIds = [
        fetchedPost.authorId,
        ...fetchedComments.map(comment => comment.authorId)
      ];
      
      // Fetch user profiles
      await loadUserProfiles(userIds);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading post:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load post');
      router.back();
    }
  };

  const loadUserProfiles = async (userIds) => {
    const uniqueUserIds = [...new Set(userIds)];
    const profiles = {};
    
    for (const userId of uniqueUserIds) {
      try {
        // Replace this with proper method call
        const profile = await authService.getUserProfileById(userId);
        if (profile) {
          profiles[userId] = profile;
        }
      } catch (error) {
        console.error(`Error loading profile for user ${userId}:`, error);
      }
    }
    
    setUserProfiles(profiles);
  };

  const getAuthorInfo = (authorId) => {
    const profile = userProfiles[authorId] || {};
    return {
      name: profile.fullname || 'Anonymous User',
      university: profile.university || 'University not specified',
      program: profile.course || 'Program not specified',
      avatar: profile.avatar || 'https://via.placeholder.com/100',
    };
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to log in to like posts');
      return;
    }
    
    try {
      await postService.toggleLikePost(post.$id, !liked);
      setLiked(!liked);
      
      // Refresh post to get updated likes count
      const updatedPost = await postService.getPost(post.$id);
      setPost(updatedPost);
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to log in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      await postService.addComment(post.$id, currentUser.$id, newComment.trim());
      setNewComment('');
      
      // Refresh comments
      const updatedComments = await postService.getComments(post.$id);
      setComments(updatedComments);
      
      // Refresh post to get updated comment count
      const updatedPost = await postService.getPost(post.$id);
      setPost(updatedPost);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Post not found</Text>
      </SafeAreaView>
    );
  }

  const author = getAuthorInfo(post.authorId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <Image source={{ uri: author.avatar }} style={styles.avatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{author.name}</Text>
              <Text style={styles.authorUniversity}>{author.university}</Text>
              <Text style={styles.authorProgram}>{author.program}</Text>
            </View>
            <Text style={styles.timeAgo}>{formatTime(post.createdAt)}</Text>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.tags}>
            {post.tags && post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.postStats}>
            <Text style={styles.statsText}>{post.likes || 0} likes</Text>
            <Text style={styles.statsText}>{post.commentsCount || 0} comments</Text>
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Heart size={20} color={liked ? '#FF3B30' : '#666'} fill={liked ? '#FF3B30' : 'none'} />
              <Text style={[styles.actionText, liked && styles.actionTextActive]}>Like</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          {comments.length > 0 ? (
            comments.map((comment) => {
              const commentAuthor = getAuthorInfo(comment.authorId);
              
              return (
                <View key={comment.$id} style={styles.comment}>
                  <Image source={{ uri: commentAuthor.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{commentAuthor.name}</Text>
                      <Text style={styles.commentUniversity}>{commentAuthor.university}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                      <TouchableOpacity style={styles.commentLike}>
                        <Text style={styles.commentLikeText}>{comment.likes || 0} likes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        {currentUser ? (
          <>
            <Image 
              source={{ uri: userProfiles[currentUser.$id]?.avatarUrl || 'https://via.placeholder.com/100' }}
              style={styles.commentInputAvatar}
            />
            <TextInput
              style={styles.commentInputField}
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleAddComment}
            >
              <Send size={20} color="#000" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.loginPrompt}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginPromptText}>Log in to comment</Text>
          </TouchableOpacity>
        )}
      </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  postStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  actionTextActive: {
    color: '#FF3B30',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  noCommentsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  commentUniversity: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  commentLike: {
    padding: 4,
  },
  commentLikeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInputField: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
});