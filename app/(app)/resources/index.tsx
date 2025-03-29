import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, BookOpen, GraduationCap, Chrome as Home, Bus, Euro, Coffee } from 'lucide-react-native';

const categories = [
  {
    id: 'academic',
    title: 'Academic Life',
    icon: GraduationCap,
    color: '#FF6B6B',
    articles: [
      {
        id: '1',
        title: 'Understanding the Italian University System',
        description: 'Learn about credits, exams, and academic calendar',
        readTime: '5 min read',
      },
      {
        id: '2',
        title: 'Study Tips for International Students',
        description: 'Effective study methods and resource recommendations',
        readTime: '7 min read',
      },
    ],
  },
  {
    id: 'housing',
    title: 'Housing Guide',
    icon: Home,
    color: '#4ECDC4',
    articles: [
      {
        id: '3',
        title: 'Finding Accommodation in Bologna',
        description: 'Tips for securing student housing and avoiding scams',
        readTime: '8 min read',
      },
      {
        id: '4',
        title: 'Understanding Rental Contracts',
        description: 'Legal aspects and important terms to know',
        readTime: '6 min read',
      },
    ],
  },
  {
    id: 'transport',
    title: 'Transportation',
    icon: Bus,
    color: '#FFD93D',
    articles: [
      {
        id: '5',
        title: 'Public Transport in Bologna',
        description: 'Bus routes, tickets, and student discounts',
        readTime: '4 min read',
      },
      {
        id: '6',
        title: 'Getting Around Italy',
        description: 'Train travel tips and regional connections',
        readTime: '5 min read',
      },
    ],
  },
  {
    id: 'finance',
    title: 'Student Finance',
    icon: Euro,
    color: '#95E1D3',
    articles: [
      {
        id: '7',
        title: 'Managing Student Budget in Italy',
        description: 'Budgeting tips and cost of living guide',
        readTime: '6 min read',
      },
      {
        id: '8',
        title: 'Scholarships and Financial Aid',
        description: 'Available funding options for international students',
        readTime: '7 min read',
      },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Student Life',
    icon: Coffee,
    color: '#FF9A8B',
    articles: [
      {
        id: '9',
        title: 'Social Life in Bologna',
        description: 'Events, meetups, and cultural activities',
        readTime: '5 min read',
      },
      {
        id: '10',
        title: 'Food and Dining Guide',
        description: 'Where to eat and typical Bolognese cuisine',
        readTime: '6 min read',
      },
    ],
  },
];

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Resources</Text>
          <Text style={styles.subtitle}>Essential guides for student life</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search resources...</Text>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Guide</Text>
          <Link href="/resources/1" asChild>
            <TouchableOpacity style={styles.featuredCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop' }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <BookOpen size={16} color="#fff" />
                  <Text style={styles.featuredBadgeText}>Comprehensive Guide</Text>
                </View>
                <Text style={styles.featuredTitle}>Getting Started in Bologna</Text>
                <Text style={styles.featuredDescription}>
                  Everything you need to know for your first month as an international student
                </Text>
                <Text style={styles.featuredMeta}>12 min read • Updated 2 days ago</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {categories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <category.icon size={24} color="#fff" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.articlesList}>
              {category.articles.map((article) => (
                <Link key={article.id} href={`/resources/${article.id}`} asChild>
                  <TouchableOpacity style={styles.articleCard}>
                    <View style={styles.articleContent}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <Text style={styles.articleDescription}>{article.description}</Text>
                      <Text style={styles.articleMeta}>{article.readTime}</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
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
  },
  articleMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
});