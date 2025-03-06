import { DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, useColorScheme } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";
import { UserDetailContext } from "@/config/UserDetailContext";

export default function RootLayout() {
  useFonts({
    'outfit': require('@/assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('@/assets/fonts/Outfit-Bold.ttf')
  });
  const theme = useColorScheme();
  const router = useRouter();
  
  // Explicitly type userDetail as DocumentData or null
  const [userDetail, setUserDetail] = useState<DocumentData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const result = await getDoc(doc(db, "users", user.email || ""));
        if (result.exists()) {
          setUserDetail(result.data());
        }
        router.replace("../(tabs)/Home");
      } else {
        const timer = setTimeout(() => {
          router.replace("../auth/Onbording");
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <StatusBar
          hidden={false}
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#121212' : '#FFF'}
        />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Your routes or screens would go here */}
        </Stack>
      </UserDetailContext.Provider>
    </GestureHandlerRootView>
  );
}
