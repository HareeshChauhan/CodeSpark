import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

interface Chapter {
  chapterName: string;
  completed?: boolean;
}

interface Course {
  courseTitle: string;
  description: string;
  type: string;
  category: string;
  image: string;
  noOfChapter: string;
  chapters: Chapter[];
}

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

export default function CourseProgressScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        await loadEnrolledCourses(user.uid);
      } else {
        setError('User not logged in.');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loadEnrolledCourses = async (userId: string) => {
    try {
      setLoading(true);
      const coursesRef = collection(db, `users/${userId}/enrolledCourses`);
      const coursesSnapshot = await getDocs(coursesRef);
      const courses: Course[] = [];
      coursesSnapshot.forEach(doc => {
        courses.push(doc.data() as Course);
      });
      setEnrolledCourses(courses);
      setError(null);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setError('Failed to load enrolled courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (chapters: Chapter[]) => {
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((ch) => ch.completed).length;
    const progressPercentage = totalChapters > 0 ? completedChapters / totalChapters : 0;
    return { completedChapters, totalChapters, progressPercentage };
  };

  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sound/pop.mp3'));
      await sound.setVolumeAsync(0.3);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (error) {
      console.error('Error playing pop sound:', error);
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.headerContainer}>
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
      <Text style={styles.headerTitle}>Course Progress</Text>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
      {renderHeader()}
      <View style={styles.heroContainer}>
        <Text style={styles.Title}>See your real-time Course Progress</Text>
        <Text style={styles.Subtitle}>Your learning journey begins now! 🚀 First steps matter most</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : enrolledCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Entypo name="open-book" size={100} color="gray" />
            <Text style={styles.emptyText}>No courses found.</Text>
          </View>
        ) : (
          enrolledCourses.map((course) => {
            const { completedChapters, totalChapters, progressPercentage } = calculateProgress(course.chapters);
            const imageKey = course.image?.trim().toLowerCase() || 'default';
            const imageSource = courseImages[imageKey] || courseImages.default;

            return (
              <TouchableOpacity
                key={course.courseTitle}
                style={styles.courseContainer}
                onPress={async () => {
                  await playPopSound();
                  router.replace({
                    pathname: '/courseView/courseDetail',
                    params: { courseParams: JSON.stringify(course) },
                  });
                }}
              >
                <View style={styles.row}>
                  <Image source={imageSource} style={styles.courseImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.courseTitle}>{course.courseTitle}</Text>
                    <Text numberOfLines={2} style={styles.courseDescription}>
                      {course.description}
                    </Text>
                    <View style={styles.chapterRow}>
                      <Ionicons name="book-outline" size={20} color={Colors.purple} />
                      <Text style={styles.chapterText}>
                        {course.noOfChapter ? `${course.noOfChapter} Chapters` : 'No Chapters'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.progressText}>
                  {completedChapters} / {totalChapters} chapters completed ({Math.round(progressPercentage * 100)}%)
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16 },
  loadingContainer: { flex: 1, marginTop: '90%', alignItems: 'center' },
  emptyContainer: { marginTop: '60%', alignItems: 'center' },
  emptyText: {
    fontFamily: 'outfit-bold',
    fontSize: 24,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  courseContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
  },
  row: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  courseImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
  courseTitle: { fontSize: 18, fontFamily: 'outfit-bold' },
  courseDescription: { color: '#555', fontFamily: 'outfit', marginTop: 4 },
  chapterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  chapterText: { marginLeft: 5, fontSize: 14, color: Colors.purple, fontFamily: 'outfit' },
  progressText: { fontSize: 16, color: Colors.purple, fontFamily: 'outfit-bold', marginTop: 8 },
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
    backgroundColor: "#1976D2",
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
    marginBottom: 10,
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
});
