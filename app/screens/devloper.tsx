import React, { useState } from "react";
import { View, Text, Image, Linking, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const developers = [
  {
    id: 1,
    name: "Sarfaraz Alam",
    bio: "Full Stack Developer | React Native Enthusiast",
    avatar: "https://ih1.redbubble.net/image.5324626697.5302/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.u1.jpg", // Replace with actual image URL
    github: "https://github.com/riocoder7",
    twitter: "https://twitter.com/Riocoder",
    linkedin: "https://www.linkedin.com/in/riocoder/",
  },
  {
    id: 2,
    name: "Hareesh Chauhan",
    bio: "Frontend Developer | React Native Enthusiast & UI/UX Specialist ",
    avatar: "https://t3.ftcdn.net/jpg/06/60/44/92/360_F_660449277_KTdoBU1B1gWjwjKPlsCwWgnxzOoorB5b.jpg", // Replace with actual image URL
    github: "https://github.com/HareeshChauhan",
    twitter: "https://twitter.com/johndoe",
    linkedin: "https://www.linkedin.com/in/johndoe/",
  },
];

const DeveloperInfo = ({ navigation }: any) => {
  const [selectedDev, setSelectedDev] = useState<number | null>(null);
  const fadeAnim = new Animated.Value(1);

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const toggleSocials = (devId: number) => {
    if (selectedDev === devId) {
      setSelectedDev(null);
    } else {
      setSelectedDev(devId);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
  <>  <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/Profile")} style={styles.backButton}>
          <AntDesign name="arrowleft" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Developer Profiles</Text>
      </View>
    <View style={styles.container}>
      {/* Full-Width Header */}
      

      {developers.map((dev) => (
        <TouchableOpacity key={dev.id} style={styles.card} onPress={() => toggleSocials(dev.id)}>
          <Image source={{ uri: dev.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{dev.name}</Text>
          <Text style={styles.bio}>{dev.bio}</Text>

          {selectedDev === dev.id && (
            <Animated.View style={[styles.socialIcons, { opacity: fadeAnim }]}>
              <TouchableOpacity onPress={() => openLink(dev.github)} style={[styles.icon, styles.github]}>
                <AntDesign name="github" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink(dev.twitter)} style={[styles.icon, styles.twitter]}>
                <FontAwesome name="twitter" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink(dev.linkedin)} style={[styles.icon, styles.linkedin]}>
                <AntDesign name="linkedin-square" size={30} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </TouchableOpacity>
      ))}
    </View>
    </>
 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  // Full-Width Header
  header: {
    flexDirection: "row",
    paddingHorizontal:20,
    paddingVertical:20,
    width: "100%",
    backgroundColor: "#1E1E1E",
    
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#1E1E1E",
    marginTop:30,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bio: {
    fontSize: 14,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  icon: {
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  github: {
    backgroundColor: "#333",
  },
  twitter: {
    backgroundColor: "#1DA1F2",
  },
  linkedin: {
    backgroundColor: "#0A66C2",
  },
});

export default DeveloperInfo;
