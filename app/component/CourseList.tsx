import React, { useEffect, useState, memo, useCallback } from 'react'; 
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app, auth } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

const db = getFirestore(app);

interface Course {
  id: string;
  courseTitle: string;
  rating?: number;
  noOfChapter?: number;
  type?: string;
  category?: string;
  image?: string; // The image file name fetched from Firebase
}

const categories: string[] = ['popular', 'coding', 'development', 'database', 'new Tech'];

// Mapping from image file name to local asset
const courseImages: { [key: string]: any } = {
  'javaprogramming': require('@/assets/images/courses/bannerj.png'),
  'python': require('@/assets/images/courses/bannerpython.png'),
  'c': require('@/assets/images/courses/bannerc.png'),
  'cpp': require('@/assets/images/courses/bannercpp.png'),
  'devops': require('@/assets/images/courses/bannerdevops.png'),
  'cyber': require('@/assets/images/courses/bannercyber.png'),
  'flutter': require('@/assets/images/courses/bannerflutter.png'),
  'javascriptprogramming': require('@/assets/images/courses/bannerjavascript.png'),
  'nosqldatabase': require('@/assets/images/courses/bannerns.png'),
  'sqldatabase': require('@/assets/images/courses/banners.png'),
  'react_n': require('@/assets/images/courses/bannerreactn.png'),
  'rust': require('@/assets/images/courses/bannerrust.png'),
  'webdev': require('@/assets/images/courses/bannerwebdev.png'),
  default: require('@/assets/images/bannerj.png'),
};
const ratingList = [4.5, 4.7, 3.5, 4.3, 3.7];
const getRandomRating = () => ratingList[Math.floor(Math.random() * ratingList.length)];

// Helper: Play pop sound
const playPopSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sound/pop.mp3') // Adjust the path if necessary
    );
    await sound.setVolumeAsync(0.3);
    await sound.playAsync();
    setTimeout(() => {
      sound.unloadAsync();
    }, 1000);
  } catch (error) {
    console.error('Error playing pop sound:', error);
  }
};

export default function CourseList() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const fetchedCourses: Course[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Course[];
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle user tapping on a course
  const handleCoursePress = async (item: Course) => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = doc(db, `users/${user.uid}/enrolledCourses`, item.courseTitle);
    const docSnap = await getDoc(courseRef);

    if (docSnap.exists()) {
      router.push({
        pathname: '../courseView/courseDetail', // Redirect to Course Detail Screen
        params: {
          courseParams: JSON.stringify(item),
        },
      });
    } else {
      router.push({
        pathname: '../courseView', // Redirect to Course View Screen
        params: {
          courseParams: JSON.stringify(item),
        },
      });
    }
  };

  // Memoized Course Card with dynamic image selection using the Firebase "image" field
  const MemoizedCourseCard = memo(({ item }: { item: Course }) => {
    const courseTitle = item.courseTitle || 'No Title Available';
    const rating = item.rating || getRandomRating();
    const lectures = item.noOfChapter || 0;
    
    // Log the image name for debugging purposes
 
    
    // Use the image name from Firebase (trimmed and lowercased) to select the correct asset
    const imageKey = item.image ? item.image.trim().toLowerCase() : 'default';
    const imageSource = courseImages[imageKey] || courseImages.default;

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={async () => {
          await playPopSound();
          handleCoursePress(item);
        }}
      >
        <Image source={imageSource} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{courseTitle}</Text>
          <View style={styles.row}>
            {renderStars(rating)}
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <View style={[styles.row, { marginBottom: 5 }]}>
            <Ionicons name="book-outline" size={16} color="#666" style={{ marginRight: 3 }} />
            <Text style={styles.subInfo}>{lectures} Chapters</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  const renderCourseItem = useCallback(({ item }: { item: Course }) => <MemoizedCourseCard item={item} />, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />);
    }
    if (halfStar) {
      stars.push(<Ionicons key="star-half" name="star-half" size={16} color="#FFD700" />);
    }
    return stars;
  };

  const getCoursesByCategory = (cat: string) => {
    if (cat === 'popular') {
      return courses.filter((course) => course.type === 'popular');
    }
    return courses.filter((course) => course.category === cat);
  };

  const renderCourseSection = (cat: string) => {
    const catCourses = getCoursesByCategory(cat);
    if (catCourses.length === 0) return null;

    const isPopular = cat === 'popular';
    const title = isPopular ? 'Must Try Courses' : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Courses`;

    return (
      <View key={cat} style={styles.sectionContainer}>
        <Text style={styles.header}>{title}</Text>
        <FlatList
          data={catCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {categories.map((cat) => renderCourseSection(cat))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginVertical: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginTop: 10,
    marginLeft: 10,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    margin: 10,
    marginLeft: 20,
    width: 300,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#666',
    fontFamily: 'outfit',
  },
  subInfo: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
    fontFamily: 'outfit',
  },
});
