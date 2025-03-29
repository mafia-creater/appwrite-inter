import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, MessageCircle, Heart, X, Image as ImageIcon } from 'lucide-react-native';

const posts = [
  {
    id: '1',
    author: {
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
      university: 'University of Bologna',
      program: 'Masters in International Relations',
    },
    content: 'Looking for roommates! I\'m starting my Masters in International Relations this September. Anyone interested in sharing an apartment near the city center?\n\nPreferences:\n• 2-3 bedroom apartment\n• Near Piazza Maggiore\n• Budget: €400-500/month\n• Female students preferred\n• Non-smokers\n\nI love cooking, enjoy occasional movie nights, and respect everyone\'s privacy. DM me if interested! 🏠✨',
    likes: 24,
    comments: 8,
    timeAgo: '2 hours ago',
    tags: ['Housing', 'Roommate Search', 'Student Life'],
  },
  {
    id: '2',
    author: {
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
      university: 'Johns Hopkins SAIS',
      program: 'MA in International Affairs',
    },
    content: 'Just discovered this amazing pizzeria near Via Zamboni! They have the best margherita I\'ve ever had. Who wants to join for dinner this weekend? 🍕\n\nRestaurant Details:\n📍 Pizzeria da Luigi\n⏰ Open till midnight\n💰 Student discount available\n⭐ Must try their buffalo mozzarella!\n\nThinking of going Saturday around 8 PM. Drop a comment if you\'re interested in joining! Great chance to meet fellow international students! 🌍',
    likes: 45,
    comments: 12,
    timeAgo: '5 hours ago',
    tags: ['Food', 'Social', 'Student Meetup'],
  },
  {
    id: '3',
    author: {
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
      university: 'University of Bologna',
      program: 'PhD in Art History',
    },
    content: '📚 Study Group Formation for Art History Course!\n\nHi everyone! I\'m organizing a study group for Professor Rossi\'s Renaissance Art course. We\'ll meet twice a week at the library to discuss readings and prepare for presentations.\n\nDetails:\n• Meeting Days: Tuesdays & Thursdays\n• Time: 3-5 PM\n• Location: University Library, 2nd Floor\n• Starting: Next Week\n\nAll levels welcome! We can help each other with Italian terminology and share resources. Comment below if interested! 📖✍️',
    likes: 32,
    comments: 15,
    timeAgo: '7 hours ago',
    tags: ['Academics', 'Study Group', 'Art History'],
  },
];

export default function CommunityScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    tags: '',
  });

  const handlePost = () => {
    // Here you would typically send the post to your backend
    setIsModalVisible(false);
    setNewPost({ content: '', tags: '' });
  };

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
          />
        </View>

        <View style={styles.posts}>
          {posts.map((post) => (
            <Link key={post.id} href={`/community/${post.id}`} asChild>
              <TouchableOpacity style={styles.post}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.author.name}</Text>
                    <Text style={styles.authorUniversity}>{post.author.university}</Text>
                    <Text style={styles.authorProgram}>{post.author.program}</Text>
                  </View>
                  <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                </View>

                <Text style={styles.postContent} numberOfLines={6}>{post.content}</Text>

                <View style={styles.tags}>
                  {post.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.action}>
                    <Heart size={20} color="#666" />
                    <Text style={styles.actionText}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action}>
                    <MessageCircle size={20} color="#666" />
                    <Text style={styles.actionText}>{post.comments}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
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

            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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