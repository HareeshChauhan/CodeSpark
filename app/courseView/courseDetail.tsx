import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, StatusBar } from 'react-native';
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
  completed: boolean;
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
  java: require('@/assets/images/courses/java.png'),
  python: require('@/assets/images/courses/python.png'),
  c: require('@/assets/images/courses/C.png'),
  cpp: require('@/assets/images/courses/cpp.png'),
  devops: require('@/assets/images/courses/devOps.png'),
  cyber: require('@/assets/images/courses/cyber.png'),
  flutter: require('@/assets/images/courses/flutter.png'),
  javascript: require('@/assets/images/courses/javascript.png'),
  nosql: require('@/assets/images/courses/noSql.png'),
  sql: require('@/assets/images/courses/sql.png'),
  react_n: require('@/assets/images/courses/react_n.png'),
  rust: require('@/assets/images/courses/rust.png'),
  webdev: require('@/assets/images/courses/webDev.png'),
  default: require('@/assets/images/courses/java.png'),
};
function courseDetail() {
  const { courseParams } = useLocalSearchParams();
  const router = useRouter();
  const [storedCourse, setStoredCourse] = useState<Course | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  let course: Course | null = null;
  if (typeof courseParams === 'string') {
    try {
      course = JSON.parse(courseParams);
    } catch (error) {
      console.error('Error parsing courseParams:', error, 'Raw Value:', courseParams);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) setUserId(user.uid);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (course && userId) loadProgress(course, userId);
  }, [course, userId]);

  const loadProgress = async (course: Course, userId: string) => {
    try {
      const courseRef = doc(db, `users/${userId}/enrolledCourses`, course.courseTitle);
      const docSnap = await getDoc(courseRef);
      setStoredCourse(docSnap.exists() ? (docSnap.data() as Course) : course);
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterPress = (index: number, chapter: Chapter) => {
    if (index > 0 && !storedCourse?.chapters[index - 1].completed) {
      Alert.alert('Access Denied', 'Complete previous chapters first.');
      return;
    }
    router.push({
      pathname: '../courseView/chapterDetail',
      params: { chapterData: JSON.stringify(chapter), courseParams: JSON.stringify(storedCourse) },
    });
  };

  // Helper function to play pop sound on every touch
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
      console.error("Error playing pop sound:", error);
    }
  };
   // Dynamically select the image based on course.image from Firebase
   let imageKey = "default";
   if (storedCourse?.image) {
     imageKey = storedCourse?.image.trim().toLowerCase();
     if (imageKey.includes(".")) {
       imageKey = imageKey.split(".")[0];
     }
   }
   const imageSource = courseImages[imageKey] || courseImages.default;

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </LinearGradient>
    );
  }

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
            <Text style={styles.cardTitle}>{storedCourse?.courseTitle}</Text>

            <View style={styles.metaContainer}>
              <View style={styles.chapterContainer}>
                <Ionicons name="book-outline" size={20} color={Colors.purple} />
                <Text style={styles.chapterText}>
                  {storedCourse?.noOfChapter} Chapters
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{storedCourse?.description}</Text>

            <Text style={styles.sectionTitle}>Chapters</Text>

            <View style={styles.chaptersContainer}>
              {storedCourse?.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter.chapterName}
                  style={styles.chapterItem}
                  onPress={async () => {
                    await playPopSound();
                    handleChapterPress(index, chapter);
                  }}
                >
                  <Text style={styles.chapterNumber}>{index + 1}.</Text>
                  <Text style={styles.chapterName}>{chapter.chapterName}</Text>
                  <Ionicons
                    name={chapter.completed ? 'checkmark-circle' : 'play'}
                    size={24}
                    color={chapter.completed ? Colors.green : Colors.purple}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  chaptersContainer: {
    backgroundColor: Colors.bgColor,
    borderRadius: 10,
    padding: 15,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
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

export default courseDetail;
