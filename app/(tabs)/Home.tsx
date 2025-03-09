import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import HomeHeader from "../component/HomeHeader";
import CourseList from "../component/CourseList";
import { LinearGradient } from "expo-linear-gradient";
import useBackHandler from "@/constants/useBackHandler";
import Ai from "../component/Ai"; // Import Ai component

export default function HomeScreen() {
  return (
    <LinearGradient colors={["rgb(142, 187, 255)", "rgb(252, 252, 252)"]} style={styles.container}>
      {/* Status Bar */}
      {/* <StatusBar hidden={false} barStyle="light-content" backgroundColor="#0D47A1" /> */}

      {/* AI Back Button */}
      <Ai />

      {/* Header */}
      <HomeHeader />

      {/* Course List */}
      <CourseList />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
