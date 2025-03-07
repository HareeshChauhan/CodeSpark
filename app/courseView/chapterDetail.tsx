import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  useWindowDimensions, 
  StyleSheet 
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

interface Topic {
  topic: string;
  explain: string;
  code?: string;
  example?: string;
}

interface Chapter {
  chapterName: string;
  completed?: boolean;
  content: Topic[];
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

function ChapterDetail() {
  const { chapterData, courseParams } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  let chapter: Chapter | null = null;
  let course: Course | null = null;

  if (typeof chapterData === 'string') {
    try {
      chapter = JSON.parse(chapterData);
    } catch (error) {
      console.error('Error parsing chapterData:', error, 'Raw Value:', chapterData);
    }
  }

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
      if (user) {
        setUserId(user.uid);
      }
    };
    fetchUser();
  }, []);

  if (!chapter || !chapter.content || chapter.content.length === 0 || !course) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: No content available for this chapter.</Text>
      </View>
    );
  }

  const totalTopics = chapter.content.length;
  const progressBarWidth = (currentTopicIndex / totalTopics) * width;

  const saveChapterCompletion = async () => {
    if (!userId || !course || !chapter) return;
    try {
      const courseRef = doc(db, `users/${userId}/enrolledCourses`, course.courseTitle);
      const docSnap = await getDoc(courseRef);
      if (docSnap.exists()) {
        const updatedChapters = course.chapters.map(ch =>
          ch.chapterName === chapter!.chapterName ? { ...ch, completed: true } : ch
        );
        await updateDoc(courseRef, { chapters: updatedChapters });
      }
    } catch (error) {
      console.error('Error updating chapter completion in Firestore:', error);
    }
  };

  const handleFinish = async () => {
    if (!chapter || !course) return;
    setLoading(true);
    chapter.completed = true;
    await saveChapterCompletion();

    const updatedCourse = {
      ...course,
      chapters: course.chapters.map(ch =>
        ch.chapterName === chapter!.chapterName ? { ...ch, completed: true } : ch
      ),
    };

    setLoading(false);
    router.replace({
      pathname: '../courseView/courseDetail',
      params: { courseParams: JSON.stringify(updatedCourse) },
    });
  };

  // Handler for when swiping stops
  const handleMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentTopicIndex(newIndex);
  };

  // Button-based navigation: programmatically scroll the view
  const handleNextTopic = () => {
    if (currentTopicIndex < totalTopics - 1) {
      const newIndex = currentTopicIndex + 1;
      setCurrentTopicIndex(newIndex);
      scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const newIndex = currentTopicIndex - 1;
      setCurrentTopicIndex(newIndex);
      scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
    }
  };

  return (
    <LinearGradient colors={["rgb(191, 163, 255)","white", "white"]} style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["rgb(78, 31, 189)", "#6A5AE0"]} style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => router.back()}>
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chapter Detail</Text>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: progressBarWidth }]} />
      </View>

      {/* Swipe-enabled content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ flex: 1 }}
      >
        {chapter.content.map((topic, index) => (
          <View key={index} style={[styles.contentContainer, { width }]}>
            <Text style={styles.topicTitle}>{topic.topic}</Text>
            <Text style={styles.topicExplain}>{topic.explain}</Text>

            {topic.code && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Code :</Text>
                <Text style={styles.codeBlock}>{topic.code}</Text>
              </View>
            )}

            {topic.example && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Example :</Text>
                <Text style={styles.exampleBlock}>{topic.example}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        {currentTopicIndex > 0 && (
          <TouchableOpacity style={styles.button} onPress={handlePreviousTopic}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentTopicIndex < totalTopics - 1 ? (
          <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNextTopic}>
            <Text style={styles.buttonText}>Next Topic</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleFinish} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Finish</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.purple,
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginVertical: 10,
  },
  progressBarBackground: {
    height: 5,
    backgroundColor: Colors.white,
    marginVertical: 20,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.purple,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  topicTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginBottom: 10,
    color: Colors.black,
  },
  topicExplain: {
    fontSize: 18,
    fontFamily: 'outfit',
    marginBottom: 10,
    color: Colors.black,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
    color: Colors.black,
  },
  codeBlock: {
    backgroundColor: Colors.black,
    padding: 20,
    borderRadius: 5,
    fontFamily: 'monospace',
    color: Colors.white,
  },
  exampleBlock: {
    backgroundColor: Colors.gray,
    padding: 20,
    borderRadius: 5,
    fontSize: 18,
    fontFamily: 'outfit',
    marginBottom: 10,
    color: Colors.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 4,
    alignItems: 'center',
  },
  nextButton: {
    marginLeft: 'auto',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
});

export default ChapterDetail;
