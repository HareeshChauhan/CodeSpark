import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "@/config/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';

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
            setUserName(userDoc.data().name);
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

  return (

      <LinearGradient
        colors={["#0D47A1", "#1976D2"]}
        style={styles.headerContainer}
      >
        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Hi ,{loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.userName}>
                {userName || "User"}
              </Text>
            )}
          </Text>
          <Text style={styles.subText}>Let's start learning</Text>
        </View>

        {/* Icons Section */}
        <View style={styles.iconContainer}>
          {/* Notification Icon */}
          <View style={styles.iconBadge}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={()=>router.push('/screens/Search')}>
          <Text style={styles.searchInput}>
            Search for Topics, Courses
          </Text>
            <Ionicons name="search" size={24} color="blue" />
        </TouchableOpacity>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40, // Adjust for status bar
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
    top: 50,
    right: 20,
  },
  iconBadge: {
    position: "relative",
    marginLeft: 15,
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 10,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "green",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
