import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const db = getFirestore();

interface Question {
  question: string;
  options: string[];
  correctAns: string;
}

const QuizzDetail: React.FC = () => {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();

  const [quizTitle, setQuizTitle] = useState<string>('Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  
  // State to ensure alert sound plays only once
  const [alertPlayed, setAlertPlayed] = useState(false);

  // Animation for question fade-in
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 2-minute (120 seconds) timer
  const [timeLeft, setTimeLeft] = useState(120);

  // Fetch quiz data from Firebase
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId as string));
        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          setQuizTitle(quizData.title || 'Quiz');
          // Shuffle and slice to 10 questions if needed
          const shuffledQuestions = quizData.quiz.sort(() => 0.5 - Math.random()).slice(0, 10);
          setQuestions(shuffledQuestions);
        } else {
          Alert.alert('Quiz not found');
        }
      } catch (error) {
        Alert.alert('Error fetching quiz:');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

  // Animate question fade-in on index change
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  // Timer effect: countdown from 120s -> 0
  useEffect(() => {
    if (completed) return; // Stop timer if quiz is completed

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [completed]);

  // Play alert sound when 10 seconds are left (only once)
  useEffect(() => {
    if (timeLeft === 10 && !alertPlayed) {
      playAlertSound();
      setAlertPlayed(true);
    }
  }, [timeLeft, alertPlayed]);

  // Function to load and play the alert sound
  const playAlertSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alert.mp3') // Adjust the path if necessary
      );
      await sound.playAsync();
      // Optionally, unload the sound after a short delay:
      setTimeout(() => {
        sound.unloadAsync();
      }, 2000);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answer === questions[currentIndex].correctAns) {
      setScore((prev) => prev + 1);
    }
    setSelectedAnswer(answer);

    // Move to next question after 1 second
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        fadeAnim.setValue(0);
      } else {
        setCompleted(true);
      }
    }, 1000);
  };

  // Format timeLeft as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes < 10 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;

  // LOADING SPINNER
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // FINAL SCORE SCREEN
  if (completed) {
    const totalQuestions = questions.length;
    const wrongCount = totalQuestions - score;
    return (
      <LinearGradient colors={['rgb(156, 139, 252)', 'rgb(234, 213, 245)']} style={styles.gradientContainer}>
        <View style={styles.scoreScreenContainer}>
          <View style={styles.scoreBoxContainer}>
            <Ionicons name="trophy" size={80} color="#FFD700" style={styles.trophyIcon} />
            <Text style={styles.resultTitle}>Congratulations!</Text>
            <Text style={styles.resultScore}>You&apos;ve scored +{score * 10} points</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Q {totalQuestions}</Text>
                <Text style={styles.scoreValue}>Total Que</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>
                  {score < 10 ? `0${score}` : score}
                </Text>
                <Text style={styles.scoreValue}>Correct</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>
                  {wrongCount < 10 ? `0${wrongCount}` : wrongCount}
                </Text>
                <Text style={styles.scoreValue}>Wrong</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Quiz</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // QUIZ SCREEN
  return (
    <LinearGradient colors={['rgb(156, 139, 252)', 'rgb(234, 213, 245)']} style={styles.gradientContainer}>
      <LinearGradient colors={['#5F48EA', '#7B5FFF']} style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => router.back()}>
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizz!</Text>
      </LinearGradient>

      {/* Top Bar: question progress and timer */}
      <View style={styles.topBar}>
        <Text style={styles.topBarQuestionCount}>
          {currentIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.topBarTimer}>{timeDisplay}</Text>
      </View>

      <View style={styles.quiz}>
        <Text style={styles.quizTitle}>{quizTitle}</Text>
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionText}>{questions[currentIndex].question}</Text>
        </Animated.View>

        {/* Options */}
        {questions[currentIndex].options.map((option) => {
          const isCorrect = selectedAnswer && option === questions[currentIndex].correctAns;
          const isWrong =
            selectedAnswer && option !== questions[currentIndex].correctAns && option === selectedAnswer;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                isCorrect && styles.correctOption,
                isWrong && styles.wrongOption,
              ]}
              onPress={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  scoreScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBoxContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  trophyIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 26,
    fontFamily: 'outfit-bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 5,
  },
  resultScore: {
    fontSize: 18,
    fontFamily: 'outfit',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
  },
  scoreBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    padding: 5,
    borderRadius: 10,
    minWidth: 60,
  },
  scoreLabel: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    color: Colors.black,
  },
  scoreValue: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: Colors.black,
    marginTop: 4,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#8B6FFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: '#FFF',
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
  topBar: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(96, 72, 234, 0.51)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 15,
  },
  topBarQuestionCount: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
  },
  topBarTimer: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
  },
  quiz: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray,
    margin: 20,
    alignItems: 'center',
    padding: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontFamily: 'outfit',
    color: Colors.black,
    marginBottom: 15,
  },
  questionContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    color: '#000',
  },
  optionButton: {
    width: '90%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: '#000',
  },
  correctOption: {
    backgroundColor: '#58d68d',
    borderColor: '#58d68d',
  },
  wrongOption: {
    backgroundColor: '#ec7063',
    borderColor: '#ec7063',
  },
});

export default QuizzDetail;
