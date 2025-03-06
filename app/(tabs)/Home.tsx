import React from "react";
import { View, StyleSheet } from "react-native";

// 1) Import or define the HomeHeader code
import HomeHeader from "../component/HomeHeader"; // <-- If you prefer, keep this in a separate file
// 2) Import or define the CourseList code
import CourseList from "../component/CourseList"; // <-- If you prefer, keep this in a separate file
import { LinearGradient } from "expo-linear-gradient";
import useBackHandler from "@/constants/useBackHandler";

export default function HomeScreen() {
  // useBackHandler();
  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
      {/* Header at the top */}
      <HomeHeader />

      {/* CourseList below */}
      <CourseList />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
