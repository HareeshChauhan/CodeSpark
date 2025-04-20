import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";

// Import Firebase auth and Firestore functions
import { auth } from "@/config/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function HomeHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user?.email) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", user.email));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name);
          } else {
            console.log("No such user data found!");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  // Helper function to play pop sound
  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sound/pop.mp3") // Adjust the path as necessary
      );
      await sound.setVolumeAsync(0.3); // Lower volume to 30%
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error("Error playing pop sound:", error);
    }
  };

  return (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.headerContainer}>
      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>
          Hi,{" "}
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.userName}>{userName || "User"}</Text>
          )}
        </Text>
        <Text style={styles.subText}>Let's start learning</Text>
      </View>

      {/* Icons Section */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={async () => {
          await playPopSound();
          router.push('/screens/Notification');
          // Optionally handle notifications press here
        }}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={async () => {
          await playPopSound();
          router.push("/screens/Search");
        }}
      >
        <Text style={styles.searchInput}>Search for Topics, Courses</Text>
        <Ionicons name="search" size={24} color="blue" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20, // Adjust for status bar
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greetingContainer: {
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    color: "white",
    fontFamily: "outfit-bold",
  },
  userName: {
    fontSize: 22,
    fontFamily: "outfit-bold",
  },
  subText: {
    fontSize: 16,
    color: "white",
    fontFamily: "outfit",
  },
  iconContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 20,
    right: 20,
  },
  iconBadge: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
});
