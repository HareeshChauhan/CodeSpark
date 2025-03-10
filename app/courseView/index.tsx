import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '@/config/firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

interface Chapter {
  chapterName: string;
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

// Mapping from normalized image key to local asset
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
function CourseView() {
  const { courseParams } = useLocalSearchParams();
  const router = useRouter();

  let course: Course | null = null;
  try {
    course = JSON.parse(courseParams as string);
  } catch (error) {
    console.error('Error parsing courseParams:', error);
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChaptersVisible, setIsChaptersVisible] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user && course) {
      checkEnrollment();
    }
  }, [user, course]);

  const checkEnrollment = async () => {
    if (!user || !course) return;
    const courseRef = doc(db, `users/${user.uid}/enrolledCourses`, course.courseTitle);
    const docSnap = await getDoc(courseRef);
    if (docSnap.exists()) setIsEnrolled(true);
  };

  const enrollCourse = async () => {
    if (!user || !course) return;
    setIsLoading(true);
    try {
      const courseRef = doc(
        collection(db, `users/${user.uid}/enrolledCourses`),
        course.courseTitle
      );
      await setDoc(courseRef, {
        ...course,
        enrolledAt: new Date().toISOString(),
      });
      setIsEnrolled(true);
    } catch (error) {
      Alert.alert('Enrollment Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const startLearning = () => {
    router.replace({
      pathname: '/courseView/courseDetail',
      params: { courseParams: JSON.stringify(course) },
    });
  };

  const toggleChaptersList = () => {
    setIsChaptersVisible((prev) => !prev);
  };

  // Helper function to play pop sound on every press
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sound/pop.mp3') // Adjust the path if necessary
      );
      // await sound.setVolumeAsync(0.3);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error("Error playing pop sound:", error);
    }
  };

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: Unable to load course details.</Text>
      </View>
    );
  }

  // Dynamically select the image based on course.image from Firebase
  let imageKey = "default";
  if (course.image) {
    imageKey = course.image.trim().toLowerCase();
    if (imageKey.includes(".")) {
      imageKey = imageKey.split(".")[0];
    }
  }
  const imageSource = courseImages[imageKey] || courseImages.default;

  return (
    <LinearGradient colors={["rgb(144, 188, 255)", "white"]} style={styles.container}>
      <StatusBar
        hidden={false}
        barStyle="light-content"
        backgroundColor="#0D47A1"
      />
      <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.iconContainer} 
          onPress={async () => {
            await playPopSound();
            router.replace('/(tabs)/Home');
          }}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.courseCard}>
          <Image 
            source={imageSource} 
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{course.courseTitle}</Text>
            <View style={styles.metaContainer}>
              <View style={styles.chapterContainer}>
                <Ionicons name="book-outline" size={20} color={Colors.purple} />
                <Text style={styles.chapterText}>
                  {course.noOfChapter} Chapters
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>

            <TouchableOpacity
              style={[
                styles.enrollButton,
                isEnrolled && styles.enrolledButton
              ]}
              onPress={async () => {
                await playPopSound();
                isEnrolled ? startLearning() : enrollCourse();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={25} color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEnrolled ? 'Start Learning' : 'Enroll Now'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await playPopSound();
                toggleChaptersList();
              }}
              style={styles.chaptersToggle}
            >
              <Text style={styles.toggleText}>
                {isChaptersVisible ? 'Hide Chapters' : 'View Chapters'}
              </Text>
              <Ionicons 
                name={isChaptersVisible ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={Colors.purple} 
              />
            </TouchableOpacity>

            {isChaptersVisible && (
              <View style={styles.chaptersContainer}>
                {course.chapters.map((chapter, index) => (
                  <View key={chapter.chapterName} style={styles.chapterItem}>
                    <Text style={styles.chapterNumber}>{index + 1}.</Text>
                    <Text style={styles.chapterName}>{chapter.chapterName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
  },
  errorText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: Colors.black,
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems:'center',
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    marginBottom: 30,
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginBottom: 5,
    color: Colors.black,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chapterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.purple,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
    color: Colors.black,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  enrollButton: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  enrolledButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'outfit-bold',
  },
  chaptersToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.black,
  },
  chaptersContainer: {
    backgroundColor: Colors.bgColor,
    borderRadius: 10,
    padding: 15,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterNumber: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.purple,
    marginRight: 10,
  },
  chapterName: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.black,
    flex: 1,
  },
});

export default CourseView;
