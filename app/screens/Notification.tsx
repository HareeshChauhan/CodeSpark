import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem('notifications');
        const parsed = saved ? JSON.parse(saved) : [];
        setNotifications(parsed);
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body || '';
      setNotifications(prev => {
        const updated = [message, ...prev];
        AsyncStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
    });

    return () => subscription.remove();
  }, []);

  const clearNotifications = async () => {
    await AsyncStorage.removeItem('notifications');
    setNotifications([]);
  };

  const renderHeader = () => (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>📩 Notifications</Text>
      <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>• {item}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#8EBBFF", "#FCFCFC"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
      {renderHeader()}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#0D47A1" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off" size={80} color={Colors.black} />
            <Text style={styles.emptyText}>No notifications received yet.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    backgroundColor: "#1976D2",
    padding: 8,
    borderRadius: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 15,
    backgroundColor: "#1976D2",
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfit-bold",
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.black,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'outfit',
    marginTop: 15,
    color: Colors.black,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: Colors.black,
    marginTop: 10,
  },
});
