import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Calendar, ThumbsUp, MessageCircle, Bookmark, Share2 } from 'lucide-react-native';

const articles = {
  '1': {
    title: 'Getting Started in Bologna',
    author: {
      name: 'Student Support Team',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&auto=format&fit=crop',
    },
    date: 'Feb 15, 2024',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop',
    content: `Welcome to Bologna! This comprehensive guide will help you navigate your first month as an international student in this historic city.

## First Steps After Arrival

1. **Register with the Police**
   - Required within 8 days of arrival
   - Bring your passport and visa
   - Get help from the International Student Office

2. **Get Your Codice Fiscale**
   - Essential Italian tax code
   - Required for many services
   - Apply at the local tax office

3. **Open a Bank Account**
   - Required documents:
     - Passport
     - Student visa
     - Codice Fiscale
     - Proof of address

## University Registration

1. **Student ID Card**
   - Visit the student office
   - Bring required documents
   - Get access to university facilities

2. **Course Registration**
   - Access the online portal
   - Select your courses
   - Check course schedules

## Healthcare

1. **Register with SSN**
   - Italian National Health Service
   - Annual fee required
   - Access to public healthcare

2. **Emergency Numbers**
   - 112: General Emergency
   - 118: Medical Emergency
   - Save these in your phone

## Transportation

1. **Bus Pass**
   - Student discounts available
   - Monthly or annual options
   - Where to buy and how to use

2. **Cycling in Bologna**
   - Bike rental services
   - Safety rules
   - Popular routes

## Daily Life

1. **Shopping**
   - Supermarket locations
   - Student-friendly stores
   - Market days and locations

2. **Internet and Phone**
   - Best providers
   - Required documents
   - Student plans

## Cultural Integration

1. **Language Support**
   - Free Italian courses
   - Language exchange events
   - Practice opportunities

2. **Student Organizations**
   - International student groups
   - Cultural associations
   - Sports clubs

## FAQ

**Q: When should I arrive in Bologna?**
A: Ideally, arrive at least two weeks before classes start to complete all necessary procedures and settle in.

**Q: Do I need to speak Italian?**
A: While many courses are in English, basic Italian knowledge will greatly help in daily life. The university offers free language courses.

**Q: How do I find accommodation?**
A: Start with the university housing office, but also check student Facebook groups and local websites. Book temporary accommodation for your first few days.

**Q: What's the cost of living?**
A: Budget approximately €800-1000 monthly, including rent, food, and transportation. Costs vary based on lifestyle and accommodation choice.

## Useful Resources

- University International Office
- Student Support Services
- Emergency Contacts
- Cultural Events Calendar
- Local Student Groups

## Tips from Current Students

1. "Get your documents sorted immediately upon arrival"
2. "Join student groups on Facebook and WhatsApp"
3. "Learn basic Italian phrases before arriving"
4. "Always carry your student ID"
5. "Explore the city on foot in your first week"

Remember, the university staff and student community are here to help you settle in. Don't hesitate to ask questions and seek support when needed.`,
    likes: 245,
    comments: 18,
    bookmarks: 156,
  },
};

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  const article = articles[id as string];

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Article not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Bookmark size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <Image source={{ uri: article.image }} style={styles.coverImage} />

        <View style={styles.articleContent}>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.authorRow}>
            <Image source={{ uri: article.author.avatar }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author.name}</Text>
              <View style={styles.articleMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.metaText}>{article.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.metaText}>{article.readTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <ThumbsUp size={16} color="#666" />
              <Text style={styles.statText}>{article.likes} likes</Text>
            </View>
            <View style={styles.stat}>
              <MessageCircle size={16} color="#666" />
              <Text style={styles.statText}>{article.comments} comments</Text>
            </View>
            <View style={styles.stat}>
              <Bookmark size={16} color="#666" />
              <Text style={styles.statText}>{article.bookmarks} bookmarks</Text>
            </View>
          </View>

          <Text style={styles.content}>{article.content}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <ThumbsUp size={20} color="#666" />
          <Text style={styles.footerButtonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <MessageCircle size={20} color="#666" />
          <Text style={styles.footerButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Bookmark size={20} color="#666" />
          <Text style={styles.footerButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Share2 size={20} color="#666" />
          <Text style={styles.footerButtonText}>Share</Text>
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
  coverImage: {
    width: '100%',
    height: 300,
  },
  articleContent: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
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
    border: 12,
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
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
});