import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Explore() {
  const router = useRouter();

  return (
    <LinearGradient colors={[ "rgb(255, 145, 145)","white"]} style={styles.container}>
      {/* Gradient Header with Back Arrow */}
      <LinearGradient colors={["#E60000", "#E65A5A"]} style={styles.headerContainer}>
  <TouchableOpacity 
    style={styles.iconContainer} 
    onPress={() => router.replace('/(tabs)/Home')}
  >
    <View style={styles.iconBadge}>
      <Ionicons name="arrow-back" size={24} color="white" />
    </View>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Explore</Text>
</LinearGradient>

      {/* Hero Section: Characters & Intro Text */}
      <View style={styles.heroContainer}>
  {/* <Image
    source={require('@/assets/images/OnBording/explore-characters.png')}
    style={styles.heroImage}
  /> */}
  <Text style={styles.Title}>
    Step into the Future of Learning!
  </Text>
  <Text style={styles.Subtitle}>
    Chat with AI, challenge yourself with quizzes, and code seamlessly—all in one place.
  </Text>
</View>

      {/* Card 1: Chat */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/Chatbot')}>
        <Image
          source={require('@/assets/images/chatbot.png')}
          style={styles.cardImage}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>AI Chatbot</Text>
          <Text style={styles.cardSubtitle}>Solve your doubts instantly with AI-powered assistance.</Text>
        </View>
      </TouchableOpacity>

      {/* Card 2: FAQ's */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/Quizz')}>
        <Image
          source={require('@/assets/images/quiz.png')}
          style={styles.cardImage}
        />
        
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Quiz Challenge</Text>
          <Text style={styles.cardSubtitle}>Test your knowledge with fun and interactive quizzes.</Text>
        </View>
      </TouchableOpacity>

      {/* Card 3: Email */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/Compiler')}>
        <View style={styles.iconContainerAlt}>
          {/* <FontAwesome5 name="laptop-code" size={60} color="black" /> */}
          <Image
          source={require("@/assets/images/OnBording/complier.png")}
          style={styles.cardImage}
        />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Compiler</Text>
          <Text style={styles.cardSubtitle}>Write, compile, and run your code in multiple programming languages.</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  /* Container for entire screen */
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  /* Gradient Header */
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
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
    backgroundColor: "#FF6F61",
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    alignItems:'center',
    color: "white",
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginVertical: 10,
  },
  /* Hero Section Styles */
  heroContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  heroImage: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  Title: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    color: 'black',
    marginBottom: 5,
  },
  Subtitle: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.black,
    textAlign: 'center',
  },
  /* Cards */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardTextContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: Colors.black,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: Colors.dgray,
  },
  iconContainerAlt: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
