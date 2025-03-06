import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5F48EA',  // Active icon color
        tabBarInactiveTintColor: Colors.black,  
    //     tabBarStyle: {
    //         backgroundColor: 'white',
    //         shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 }, // Shadow at the bottom
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // // ✅ Shadow for Android
    // elevation: 2,
    //       },
        //   headerStyle: {
        //     // backgroundColor: Col,  // Optional: Set header background color
        //     elevation: 2,  // Remove shadow on Android
        //     shadowOpacity: 2,  // Set shadow height to 0
        //   },
          
            // Tab bar background
      }}>
        <Tabs.Screen name='Home' options={{
            headerShown: false,
            tabBarIcon: ({color})=> <Ionicons name="home-outline" size={30} color={color} />,
            tabBarLabel: 'Home'
        }}/>
        <Tabs.Screen name='Explore' options={{
            headerShown: false,
            tabBarIcon: ({color})=> <Ionicons name="paper-plane-outline" size={30} color={color} />,
            tabBarLabel: 'Explore'
        }}/>
        <Tabs.Screen name='Progress' options={{
            headerShown: false,
            tabBarIcon: ({color})=>  <MaterialCommunityIcons name="progress-check" size={30} color={color} />,
            tabBarLabel: 'Progress'
        }}/>
        <Tabs.Screen name='Profile' options={{
            headerShown: false,
            tabBarIcon: ({color})=> <Ionicons name="person-circle-outline" size={30} color={color} />,
            tabBarLabel: 'Profile',
        }}/>
    </Tabs>
  )
}