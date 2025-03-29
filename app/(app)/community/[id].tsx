import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Send, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

const posts = {
  '1': {
    id: '1',
    author: {
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
      university: 'University of Bologna',
      program: 'Masters in International Relations',
    },
    content: 'Looking for roommates! I\'m starting my Masters in International Relations this September. Anyone interested in sharing an apartment near the city center?\n\nPreferences:\n• 2-3 bedroom apartment\n• Near Piazza Maggiore\n• Budget: €400-500/month\n• Female students preferred\n• Non-smokers\n\nI love cooking, enjoy occasional movie nights, and respect everyone\'s privacy. DM me if interested! 🏠✨',
    likes: 24,
    timeAgo: '2 hours ago',
    tags: ['Housing', 'Roommate Search', 'Student Life'],
    comments: [
      {
        id: 1,
        author: {
          name: 'Sofia Bianchi',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
          university: 'University of Bologna',
        },
        content: 'Hey Maria! I\'m also looking for a roommate near Piazza Maggiore. I\'m starting my Masters in Art History. Would love to connect and discuss further! 😊',
        timeAgo: '1 hour ago',
        likes: 3,
      },
      {
        id: 2,
        author: {
          name: 'Emma Chen',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop',
          university: 'Johns Hopkins SAIS',
        },
        content: 'I know a great apartment on Via Zamboni that might interest you! It\'s a 3-bedroom place, about €450/month per person. Let me know if you\'d like more details.',
        timeAgo: '45 minutes ago',
        likes: 5,
      },
    ],
  },
  // Add other posts here...
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const post = posts[id as string];
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Post not found</Text>
      </SafeAreaView>
    );
  }

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
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorUniversity}>{post.author.university}</Text>
              <Text style={styles.authorProgram}>{post.author.program}</Text>
            </View>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.tags}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.postStats}>
            <Text style={styles.statsText}>{post.likes} likes</Text>
            <Text style={styles.statsText}>{post.comments.length} comments</Text>
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={() => setLiked(!liked)}
            >
              <Heart size={20} color={liked ? '#FF3B30' : '#666'} fill={liked ? '#FF3B30' : 'none'} />
              <Text style={[styles.actionText, liked && styles.actionTextActive]}>Like</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          {post.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                  <Text style={styles.commentUniversity}>{comment.author.university}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentFooter}>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                  <TouchableOpacity style={styles.commentLike}>
                    <Text style={styles.commentLikeText}>{comment.likes} likes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' }}
          style={styles.commentInputAvatar}
        />
        <TextInput
          style={styles.commentInputField}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.sendButton}>
          <Send size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});