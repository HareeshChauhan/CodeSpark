import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { auth, db } from '@/config/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

interface Course {
  courseTitle: string;
  description: string;
  type: string;
  category: string;
  image: string;
  noOfChapter: string;
  chapters: Array<any>;
}
const courseImages: { [key: string]: any } = {
  'java': require('@/assets/images/courses/java.png'),
  'python': require('@/assets/images/courses/python.png'),
  'c': require('@/assets/images/courses/C.png'),
  'cpp': require('@/assets/images/courses/cpp.png'),
  'devops': require('@/assets/images/courses/devOps.png'),
  'cyber': require('@/assets/images/courses/cyber.png'),
  'flutter': require('@/assets/images/courses/flutter.png'),
  'javascript': require('@/assets/images/courses/javascript.png'),
  'nosql': require('@/assets/images/courses/noSql.png'),
  'sql': require('@/assets/images/courses/sql.png'),
  'react_n': require('@/assets/images/courses/react_n.png'),
  'rust': require('@/assets/images/courses/rust.png'),
  'webdev': require('@/assets/images/courses/webDev.png'),
  default: require('@/assets/images/java.png'),
};
const ratingList = [4.5, 4.7, 3.5, 4.3, 3.7];
const getRandomRating = () => ratingList[Math.floor(Math.random() * ratingList.length)];

// Helper function to play pop sound
const playPopSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sound/pop.mp3') // Adjust path if necessary
    );
    await sound.setVolumeAsync(0.3); // Lower volume to 30%
    await sound.playAsync();
    setTimeout(() => {
      sound.unloadAsync();
    }, 1000);
  } catch (error) {
    console.error('Error playing pop sound:', error);
  }
};

export default function EnrolledCoursesScreen() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    try {
      const coursesRef = collection(db, `users/${user.uid}/enrolledCourses`);
      const q = query(coursesRef);
      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        courses.push(doc.data() as Course);
      });
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToCourseDetails = (course: Course) => {
    router.replace({
      pathname: '/courseView/courseDetail',
      params: { courseParams: JSON.stringify(course) },
    });
  };

  // Function to render star icons for rating
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

  // Memoized Course Card component with description included
  const MemoizedCourseCard = memo(({ item }: { item: Course }) => {
    const courseTitle = item.courseTitle || 'No Title Available';
    const rating = getRandomRating();
    const lectures = parseInt(item.noOfChapter, 10) || 0;
    const imageKey = item.image ? item.image.trim().toLowerCase() : 'default';
    const imageSource = courseImages[imageKey] || courseImages.default;
    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={async () => {
          await playPopSound();
          navigateToCourseDetails(item);
        }}
      >
        <Image source={imageSource} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{courseTitle}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
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

  const renderCourseItem = useCallback(({ item }: { item: Course }) => {
    return <MemoizedCourseCard item={item} />;
  }, []);

  if (isLoading) {
    return (
      <LinearGradient colors={["rgb(114, 171, 255)", "white"]} style={styles.container}>
      {/* Header with back arrow */}
      <StatusBar
              hidden={false}
              barStyle="light-content"
              backgroundColor="rgb(11, 103, 240)"
            />
      <LinearGradient
        colors={["rgb(11, 103, 240)", "rgb(60, 138, 255)"]}
        style={styles.headerContainer}
      >
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
        <Text style={styles.headerTitle}>Enrolled Courses</Text>
      </LinearGradient>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["rgb(114, 171, 255)", "white"]} style={styles.container}>
      {/* Header with back arrow */}
      <StatusBar
              hidden={false}
              barStyle="light-content"
              backgroundColor="rgb(11, 103, 240)"
            />
      <LinearGradient
        colors={["rgb(11, 103, 240)", "rgb(60, 138, 255)"]}
        style={styles.headerContainer}
      >
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
        <Text style={styles.headerTitle}>Enrolled Courses</Text>
      </LinearGradient>
      <View style={styles.heroContainer}>
        <Text style={styles.Title}>See your Enrolled Courses</Text>
        <Text style={styles.Subtitle}>
          Your learning journey begins now! 🚀 First steps matter most
        </Text>
      </View>

      {enrolledCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Entypo name="open-book" size={100} color={Colors.black} />
          <Text style={styles.emptyText}>
            You are not enrolled in any courses yet.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={enrolledCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.courseTitle}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  iconContainer: {
    position: "absolute",
    top: 15,
    left: 20,
    zIndex: 1,
  },
  iconBadge: {
    position: "relative",
    backgroundColor: "rgb(79, 149, 255)",
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginVertical: 10,
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom:10,
    paddingHorizontal: 10,
  },
  Title: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    color: 'black',
    marginBottom: 5,
    textAlign: 'center',
  },
  Subtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.black,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'outfit-bold',
    fontSize: 24,
    color: Colors.black,
    textAlign: 'center',
  },
  listContainer: {
    alignItems: 'center',
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    margin: 20,
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
  cardDescription: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#555',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
