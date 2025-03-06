import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image ,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';

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
    const completedChapters = chapters.filter((chapter) => chapter.completed).length;
    const progressPercentage = totalChapters > 0 ? completedChapters / totalChapters : 0;
    return { completedChapters, totalChapters, progressPercentage };
  };

  return (
    <LinearGradient colors={["rgb(114, 171, 255)", "white"]} style={styles.container}>
      <LinearGradient
        colors={["rgb(11, 103, 240)", "rgb(60, 138, 255)"]}
        style={styles.headerContainer}
      >
        <TouchableOpacity style={styles.iconContainer} onPress={()=> router.back()}>
      {/* Notification Icon */}
      <View style={styles.iconBadge}>
      <Ionicons name="arrow-back" size={24} color="white" />
        </View>
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Progress</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={{ marginTop: '90%' }}>
            <ActivityIndicator size={50} color={Colors.purple} />
          </View>
        ) : enrolledCourses.length === 0 ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: '50%' }}>
            <Entypo name="open-book" size={100} color={Colors.black} />
            <Text style={{ fontFamily: 'outfit-bold', fontSize: 24, color: Colors.black,textAlign:'center' }}>
            You are not enrolled in any courses yet.
            </Text>
          </View>
        ) : (
          enrolledCourses.map((course) => {
            const { completedChapters, totalChapters, progressPercentage } = calculateProgress(course.chapters);
            return (
              <TouchableOpacity 
                key={course.courseTitle} 
                style={styles.courseContainer}
                onPress={() =>
                  router.replace({
                    pathname: '/courseView/courseDetail',
                    params: { courseParams: JSON.stringify(course) },
                  })
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderRadius: 8 }}>
                  <Image
                    source={require('@/assets/images/java.png')}
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
                <View style={styles.circularProgressContainer}>
                  <CircularProgress
                    size={45}
                    width={5}
                    fill={progressPercentage * 100}
                    tintColor={Colors.purple}
                    backgroundColor="lightgray"
                  >
                    {() => (
                      <Text style={{ color: Colors.black, fontFamily: 'outfit', fontSize: 12 }}>
                        {Math.round(progressPercentage * 100)}%
                      </Text>
                    )}
                  </CircularProgress>
                </View>
                <Text style={styles.progressText}>
                  {completedChapters} out of {totalChapters} chapters completed
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
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems:'center',
  },
  iconContainer: {
    position: "absolute" as 'absolute',
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
    // marginLeft: 50,
  },
  scrollContainer: {
    marginTop: 10,
    paddingBottom: 20,
    backgroundColor:"rgba(255, 255, 255, 0)"
  },
  courseContainer: {
    margin: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  // progressBarBackground: {
  //   height: 8,
  //   backgroundColor: 'white',
  //   borderRadius: 5,
  //   marginBottom: 10,
  //   overflow: 'hidden',
    
  // },
  // progressBarFill: {
  //   height: '100%',
  //   backgroundColor: Colors.purple,
  //   borderRadius: 5,
  // },
  progressText: {
    fontSize: 16,
    color: Colors.purple,
  },
  circularProgressContainer: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 25,
    // alignItems: 'center',
    marginBottom: 10,
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    right: 10,
  },
});

export default CourseProgressScreen;