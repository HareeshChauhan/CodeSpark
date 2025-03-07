import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '@/config/firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

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
      const courseRef = doc(collection(db, `users/${user.uid}/enrolledCourses`), course.courseTitle);
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
    setIsChaptersVisible(prev => !prev);
  };

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: Unable to load course details.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["rgb(144, 188, 255)", "white"]} style={styles.container}>
      <LinearGradient
        colors={["#0D47A1", "#1976D2"]}
        style={styles.headerContainer}
      >
        <TouchableOpacity style={styles.iconContainer} onPress={()=> router.replace('/(tabs)/Home')}>
      {/* Notification Icon */}
      <View style={styles.iconBadge}>
      <Ionicons name="arrow-back" size={24} color="white" />
        </View>
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.courseCard}>
          <Image 
            source={require('@/assets/images/java.png')} 
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
              onPress={isEnrolled ? startLearning : enrollCourse}
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
              onPress={toggleChaptersList}
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
    justifyContent: "center" as 'center',
    alignItems: "center" as 'center',
    backgroundColor: 'white'
  },
  errorText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: Colors.black
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
    position: "absolute" as 'absolute',
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
    // marginLeft: 50,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    // marginTop: 20,
    paddingTop:20,
    
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 3,
    marginBottom: 30,
  },
  cardImage: {
    width: "100%" as '100%',
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
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    alignItems: 'center' as 'center',
    marginBottom: 5,
  },
  chapterContainer: {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
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
    alignItems: 'center' as 'center',
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
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
    alignItems: 'center' as 'center',
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
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
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