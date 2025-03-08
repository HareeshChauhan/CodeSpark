import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Octicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '@/config/firebaseConfig';
import { UserDetailContext } from '@/config/UserDetailContext';
import { useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';

interface UserData {
  name: string;
  email: string;
  profileImage?: string;
}

const db = getFirestore();

// Helper function to play pop sound
const playPopSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sound/pop.mp3') // Adjust the path if necessary
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

export default function ProfileScreen() {
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', profileImage: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user?.email) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.email));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.log('No such user data found!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/Onbording');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <LinearGradient colors={['rgb(164, 148, 255)', 'rgb(242, 239, 255)']} style={styles.container}>
      <LinearGradient colors={['#5F48EA', '#7B5FFF']} style={styles.topBar}>
        <View style={styles.profileRow}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: getRandomColor(userData.name) },
              ]}
            >
              <Text style={styles.imageText}>
                {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            {loading ? (
              <ActivityIndicator size="small" color="#7B5FFF" />
            ) : (
              <>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <MenuItem 
          icon={<Ionicons name="bookmarks-outline" size={26} color="#5F48EA" />} 
          title="Enrolled Courses" 
          subtitle="Explore your all enrolled courses" 
          onPress={async () => {
            await playPopSound();
            router.push('/screens/myCourse');
          }} 
        />
        <MenuItem 
          icon={<MaterialCommunityIcons name="progress-check" size={26} color="#5F48EA" />} 
          title="Course Progress" 
          subtitle="See your real-time Course Progress" 
          onPress={async () => {
            await playPopSound();
            router.push('/(tabs)/Progress');
          }} 
        />
        <MenuItem 
          icon={<Octicons name="dependabot" size={26} color="#5F48EA" />} 
          title="Chat with AI" 
          subtitle="Solve your doubts instantly with AI-powered assistance." 
          onPress={async () => {
            await playPopSound();
            router.push('/screens/Chatbot');
          }} 
        />
        <MenuItem 
          icon={<FontAwesome5 name="laptop-code" size={26} color="#5F48EA" />} 
          title="Compiler" 
          subtitle="Write, compile, and run your code in multiple programming languages." 
          onPress={async () => {
            await playPopSound();
            router.push('/screens/Compiler');
          }} 
        />
        <MenuItem 
          icon={<MaterialIcons name="quiz" size={28} color="#5F48EA" />} 
          title="Quiz Challenge" 
          subtitle="Test your knowledge with fun and interactive quizzes." 
          onPress={async () => {
            await playPopSound();
            router.push('/screens/Quizz');
          }} 
        />
        <MenuItem 
          icon={<Ionicons name="notifications-outline" size={26} color="#5F48EA" />} 
          title="Notifications" 
          subtitle="Explore the important notifications" 
          onPress={async () => {
            await playPopSound();
            router.push('/screens/myCourse');
          }} 
        />
        <TouchableOpacity 
          style={styles.signOutBtn} 
          onPress={async () => {
            await playPopSound();
            handleSignOut();
          }}
        >
          <Ionicons name="power" size={24} color="red" />
          <Text style={styles.signOutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

interface MenuItemProps {
  icon: JSX.Element;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        {icon}
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CFCFCF" />
    </TouchableOpacity>
  );
}

function getRandomColor(name: string) {
  const colors = ['#FF5733', '#33A1FF', '#FF33A1', '#33FF57', '#A133FF', '#FFA133'];
  if (!name) return '#7B5FFF';
  return colors[name.charCodeAt(0) % colors.length] || '#7B5FFF';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    
    justifyContent: 'center',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  imageText: {
    fontSize: 34,
    fontFamily: 'outfit-bold',
    color: 'white',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    marginRight:10,
    // paddingLeft:5,
    // width:"90%",
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: 'white',
  },
  userEmail: {
    marginRight:10,
    // width:"90%",
    // maxWidth:'90%',
    fontSize: 18,
    fontFamily: 'outfit',
    color: 'white',
  },
  menuItem: {
    flexDirection: 'row',
    marginTop: 15,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTextContainer: {
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#777',
  },
  signOutBtn: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  signOutText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'red',
    fontFamily: 'outfit-bold',
  },
});

