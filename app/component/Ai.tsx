import { View, TouchableOpacity, StyleSheet,Image } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";

export default function Ai() {
  const router = useRouter(); // Move inside the component

  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sound/pop.mp3") // Ensure correct path
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

  return (
    <TouchableOpacity
      style={styles.iconContainer}
      onPress={async () => {
        await playPopSound();
        router.push('/screens/Chatbot');
      }}
    >
      <View style={styles.iconBadge}>
        <Image
                  source={require('@/assets/images/chatbot.png')}
                  style={styles.Image}
                />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    bottom: 40,
    right: 10,
    zIndex: 1,
    borderRadius:25,
  },
  iconBadge: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    // padding: 5,
    borderRadius:25,
  },
  Image:{
    width:70,
    height:70,
  }
});
