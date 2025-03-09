import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native'; 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CircularProgress } from 'react-native-circular-progress';
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
  'java': require('@/assets/images/courses/javap.png'),
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
  default: require('@/assets/images/javap.png'),
};

function CourseProgressScreen() {
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
    const completedChapters = chapters.filter(chapter => chapter.completed).length;
    const progressPercentage = totalChapters > 0 ? completedChapters / totalChapters : 0;
    return { completedChapters, totalChapters, progressPercentage };
  };

  // Helper function to play pop sound
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sound/pop.mp3') // Adjust path if necessary
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

  if (loading) {
    return (
      <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color={Colors.purple} />
      </View>
      </LinearGradient>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
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
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: '50%' }}>
        <Entypo name="open-book" size={100} color={Colors.black} />
        <Text style={{ fontFamily: 'outfit-bold', fontSize: 24, color: Colors.black, textAlign: 'center' }}>
          You are not enrolled in any courses yet.
        </Text>
      </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
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
      <View style={styles.heroContainer}>
        <Text style={styles.Title}>See your real-time Course Progress</Text>
        <Text style={styles.Subtitle}>
          Your learning journey begins now! 🚀 First steps matter most
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {enrolledCourses.map(course => {
          const { completedChapters, totalChapters, progressPercentage } = calculateProgress(course.chapters);
          const imageKey = course.image ? course.image.trim().toLowerCase() : 'default';
        const imageSource = courseImages[imageKey] || courseImages.default;

          return (
            <TouchableOpacity 
              key={course.courseTitle} 
              style={styles.courseContainer}
              onPress={async () => {
                await playPopSound();
                await router.replace({
                  pathname: '/courseView/courseDetail',
                  params: { courseParams: JSON.stringify(course) },
                });
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderRadius: 8 }}>
                <Image
                  source={imageSource}
                  style={{ width: 100, height: 100, borderRadius: 8, marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'outfit-bold' }}>
                    {course.courseTitle}
                  </Text>
                  <Text numberOfLines={2} style={{ color: '#555', fontFamily: 'outfit' }}>
                    {course.description}
                  </Text>
                  <View style={{ flexDirection: 'row', marginVertical: 7 }}>
                    <Ionicons name="book-outline" size={20} color={Colors.purple} />
                    <Text style={{ fontSize: 14, fontFamily: 'outfit', color: Colors.purple, marginLeft: 5 }}>
                      {course.noOfChapter ? `${course.noOfChapter} Chapters` : 'No Chapters Available'}
                    </Text>
                  </View>
                </View>
              </View>
              <CircularProgress
                size={45}
                width={5}
                fill={progressPercentage * 100}
                tintColor={Colors.purple}
                backgroundColor="rgb(241, 241, 241)"
                style={styles.circularProgressContainer}
              >
                {() => (
                  <Text style={{ color: Colors.black, fontFamily: 'outfit', fontSize: 12 }}>
                    {Math.round(progressPercentage * 100)}%
                  </Text>
                )}
              </CircularProgress>
              <Text style={styles.progressText}>
                {completedChapters} out of {totalChapters} chapters completed
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 1,
  },
  iconBadge: {
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
  scrollContainer: {
    marginTop: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  courseContainer: {
    margin: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderRadius: 10,
  },
  circularProgressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    marginBottom: 10,
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    right: 10,
  },
  progressText: {
    fontSize: 16,
    color: Colors.purple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CourseProgressScreen;
