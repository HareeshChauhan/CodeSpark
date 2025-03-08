import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { UserDetailContext } from '@/config/UserDetailContext';
import Colors from '@/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const { setUserDetail } = useContext(UserDetailContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user details from Firestore
        const result = await getDoc(doc(db, "users", user.email || ""));
        if (result.exists()) {
          setUserDetail(result.data());
        }
        // Navigate immediately to Home
        router.replace('../(tabs)/Home');
      } else {
        // If no user, wait 3 seconds and then navigate to Onboarding
        const timer = setTimeout(() => {
          router.replace('../auth/Onbording');
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
    return () => unsubscribe();
  }, [router, setUserDetail]);

  return (
    <LinearGradient
      colors={['rgb(241, 226, 255)', 'rgb(199, 227, 255)']}
      style={styles.container}
    >
      {/* <StatusBar hidden /> */}
      <Image
        source={require('@/assets/images/logo.png')} // Adjust path to your logo asset
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to CodeSpark</Text>
      <Text style={styles.subtitle}>Let's get your learning journey started.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius:10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'outfit-bold', // Ensure this font is loaded
    color: Colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'outfit', // Ensure this font is loaded
    color: Colors.black,
  },
});
