import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { UserDetailContext } from '@/config/UserDetailContext';
import Colors from '@/constants/Colors';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SplashScreen() {
  const router = useRouter();
  const { setUserDetail } = useContext(UserDetailContext);

  const messages = [
    "Step by step, you're mastering the dev game! 👨‍💻",
    "You've got the tools to win — now go compile success! 💪",
    "Every bug you fix is one step closer to mastery! 🐛⚡",
    "Consistency beats intensity. Keep showing up! 📆",
    "Your journey as a developer starts now — let's go! 🚀",
    "With the right tools, you're unstoppable! 🤖",
    "Courses, projects, feedback — your dev stack is strong! 🔥",
    "One lesson at a time, you're leveling up! 👨‍💻👩‍💻",
    "Build it. Ship it. Repeat. You're growing fast! 💻✨",
    "You're not just coding — you're building your future! 🧠",
    "Smarter coding starts with asking for help — you're not alone! 💡🤖",
    "Take on today's challenge — you're getting sharper! ✨",
    "Keep your streak going — consistency builds momentum! 🔥",
    "Fail fast, learn faster — you're on the right path! 🧪",
    "You're unlocking your full dev path — keep going! 💼📱",
    "Code, learn, repeat — that's your rhythm! 🎧🧑‍💻",
    "Even 10 minutes of coding pushes you forward! ⏱️",
    "Turn your ideas into reality — start building! 💥",
    "Celebrate the small wins — they add up! 🏆",
    "You've got everything you need to level up! 🧰",
    "One bug fixed = one step forward. Keep it up! 🐞🔧",
    "Track your progress and watch your skills grow! 📈",
    "Sometimes it's ambition > sleep — you've got this! 😅💻",
    "Write bold code and own your dev journey! 🚀",
    "Code. Learn. Build. You’re living the dream! 🎮",
    "Errors are part of progress — fix it and grow! 🔴➡️🟢",
    "Dream big. Build bigger. One line at a time! 🏗️💡",
    "You're unlocking new skills daily — power up! 🦸‍♂️🧑‍💻",
    "Your keyboard is your sword — slay those bugs! ⚔️🐛",
    "Even 5 minutes of coding helps you grow! 📚⌛",
  ];

  const getRandomMessage = () => messages[Math.floor(Math.random() * messages.length)];

  const storeNotification = async (message: string) => {
    try {
      const existing = await AsyncStorage.getItem('notifications');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [message, ...parsed];
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
    } catch (err) {
      console.error("Error storing notification:", err);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications in settings.');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: true,
        });
      }
    } else {
      Alert.alert('Physical device required', 'Notifications only work on real devices.');
    }
  };

  const scheduleMotivationalNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Motivation Boost ✨',
        body: getRandomMessage(),
      },
      trigger: {
        seconds: 20,
        repeats: true,
      },
    });
  };

  useEffect(() => {
    const listener = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body || '';
      storeNotification(message);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await registerForPushNotificationsAsync();
      await scheduleMotivationalNotifications();

      if (user) {
        const result = await getDoc(doc(db, 'users', user.email || ''));
        if (result.exists()) {
          setUserDetail(result.data());
        }
        router.replace('../(tabs)/Home');
      } else {
        const timer = setTimeout(() => {
          router.replace('../auth/Onbording');
        }, 3000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      listener.remove();
      unsubscribe();
    };
  }, [router, setUserDetail]);

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"white"
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
});
