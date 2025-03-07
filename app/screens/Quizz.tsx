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
import { Audio } from 'expo-av';

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

  // Function to play pop sound for every touch
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sound/pop.mp3') // Adjust the path if necessary
      );
      await sound.setVolumeAsync(0.3); // Lower volume to 30%
      await sound.playAsync();
      // Unload the sound after playing
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error('Error playing pop sound:', error);
    }
  };

  // Handle quiz press: navigate to quiz detail screen
  const handleQuizPress = (quiz: any) => {
    router.push({
      pathname: '/screens/quizzDetail',
      params: { quizId: quiz.id },
    });
  };

  // Render each quiz item with pop sound on press
  const renderQuizItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.quizItem}
      onPress={async () => {
        await playPopSound();
        handleQuizPress(item);
      }}
    >
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
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={async () => {
            await playPopSound();
            router.back();
          }}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizz!</Text>
      </LinearGradient>

      {/* Greeting text */}
      <View style={styles.header}>
        <Text style={styles.headingText}>Interactive Quiz</Text>
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
