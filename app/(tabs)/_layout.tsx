import React from 'react';
import { TouchableOpacity, StatusBar } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';
import { Audio } from 'expo-av';

// Helper function: play pop sound
const playPopSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sound/pop.mp3') // Adjust path if necessary
    );
    await sound.setVolumeAsync(0.3); // Lower volume to 30%
    await sound.playAsync();
    setTimeout(() => {
      sound.unloadAsync();
    }, 1000);
  } catch (error) {
    console.error('Error playing pop sound:', error);
  }
};

// Custom tab bar button that plays the pop sound on press
const PopTabButton = (props: any) => {
  const { onPress, ...rest } = props;
  const handlePress = async () => {
    await playPopSound();
    if (onPress) onPress();
  };
  return <TouchableOpacity onPress={handlePress} {...rest} />;
};

export default function TabLayout() {
  const segments = useSegments();
  // Ensure activeTab is always a string using fallback values
  const activeTab = segments[1] ?? segments[0] ?? 'Home';

  // Map each tab to a specific StatusBar background color
  const statusBarColors: { [key: string]: string } = {
    Home: '#0D47A1',
    Explore: '#E60000',
    Progress: '#0D47A1',
    Profile: '#5F48EA',
  };

  const statusBarColor = statusBarColors[activeTab] || '#5F48EA';

  return (
    <>
      <StatusBar hidden={false} barStyle="light-content" backgroundColor={statusBarColor} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#5F48EA',
          tabBarInactiveTintColor: Colors.black,
          // Use our custom button for all tab items
          tabBarButton: (props) => <PopTabButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={30} color={color} />,
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="Explore"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="paper-plane-outline" size={30} color={color} />,
            tabBarLabel: 'Explore',
          }}
        />
        <Tabs.Screen
          name="Progress"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="progress-check" size={30} color={color} />,
            tabBarLabel: 'Progress',
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={30} color={color} />,
            tabBarLabel: 'Profile',
          }}
        />
      </Tabs>
    </>
  );
}
