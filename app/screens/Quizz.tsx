import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/config/firebaseConfig';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

// Firestore reference
const db = getFirestore(app);

const Quizz: React.FC = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const fetchedQuizzes: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedQuizzes.push({ id: doc.id, ...doc.data() });
        });
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizPress = (quiz: any) => {
    router.push({
      pathname: '/screens/quizzDetail',
      params: { quizId: quiz.id },
    });
  };

  const renderQuizItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.quizItem} onPress={() => handleQuizPress(item)}>
      <Image source={require('@/assets/images/quiz.png')} style={styles.quizImage} />
      <Text style={styles.quizTitle}>{item.title || 'Untitled Quiz'}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      // Light gradient background
      colors={['#E0C3FC', '#8EC5FC']}
      style={styles.gradientContainer}
    >
      {/* Header with back arrow */}
      <LinearGradient colors={['#5F48EA', '#7B5FFF']} style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconContainer} onPress={() => router.back()}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quizz!</Text>
              </LinearGradient>
        {/* Greeting text, styled like the reference image's heading */}
        <View style={styles.header}>
        <Text style={styles.headingText}>
        Interactive Quiz
        </Text>
        {/* Subheading, to mimic the reference image's smaller text */}
        <Text style={styles.subHeading}>
        Test your knowledge with engaging quizzes that reinforce your learning.
        </Text>
        </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  iconContainer: { position: 'absolute', top: 15, left: 20, zIndex: 1 },
  iconBadge: { backgroundColor: '#8B6FFF', padding: 8, borderRadius: 10 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'outfit-bold', marginVertical: 10 },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headingText: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
    color: Colors.black,
  },
  subHeading: {
    marginTop: 6,
    fontSize: 14,
    color: '#444',
    fontFamily: 'outfit',
  },

  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quizItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    marginBottom: 15,
    width: '47%',
    overflow: 'hidden',
    // Shadow for iOS
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 3,
    // // Elevation for Android
    // elevation: 4,
  },
  quizImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  quizTitle: {
    padding: 8,
    fontSize: 16,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    color: Colors.black,
  },
});

export default Quizz;
