import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ToastAndroid, 
  TextInput, 
  ActivityIndicator 
} from 'react-native'; 
import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { UserDetailContext } from '@/config/UserDetailContext';
import { User } from "firebase/auth";
import Colors from '@/constants/Colors';
import useBackHandler from "@/constants/useBackHandler";
import Ionicons from '@expo/vector-icons/Ionicons'; // For eye icon
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

// Helper function to play pop sound
const playPopSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sound/pop.mp3') // Adjust path if necessary
    );
    await sound.setVolumeAsync(0.3); // Set volume to 30%
    await sound.playAsync();
    setTimeout(() => {
      sound.unloadAsync();
    }, 1000);
  } catch (error) {
    console.error("Error playing pop sound:", error);
  }
};

// Higher-order function to wrap onPress callbacks with a pop sound effect
const withPopSound = (callback?: () => void) => async () => {
  await playPopSound();
  if (callback) callback();
};

export default function SignUp() {
  useBackHandler();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!fullName) {
      ToastAndroid.show('Full Name required', ToastAndroid.BOTTOM);
      return false;
    }
    if (/\d/.test(fullName)) {
      ToastAndroid.show('Invalid Name Format', ToastAndroid.BOTTOM);
      return false;
    }
    if (!email.includes('@')) {
      ToastAndroid.show('Invalid Email Format', ToastAndroid.BOTTOM);
      return false;
    }
    if (password.length < 6) {
      ToastAndroid.show('Password too short', ToastAndroid.BOTTOM);
      return false;
    }
    if (password.length > 256) {
      ToastAndroid.show('Password too long', ToastAndroid.BOTTOM);
      return false;
    }
    return true;
  };

  const CreateNewAccount = () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (resp) => {
        const user = resp.user;
        console.log(user);
        await SaveUser(user);
        setLoading(false);
        router.replace('../Home');
      })
      .catch(e => {
        console.log(e.message);
        setLoading(false);
        ToastAndroid.show('Incorrect Email & Password', ToastAndroid.BOTTOM);
      });
  };

  const SaveUser = async (user: User) => {
    const data = {
      name: fullName,
      email: email,
      password: password,
      uid: user?.uid
    };
    await setDoc(doc(db, 'users', email), data);
    setUserDetail(data);
  };

  return (
    <LinearGradient
      colors={['rgb(241, 226, 255)', 'rgb(199, 227, 255)']}
      style={styles.container}
    >
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Create New Account</Text>
      <Text style={styles.subtitle}>Let's get your learning journey started.</Text>

      <TextInput 
        placeholder='Full Name' 
        value={fullName} 
        onChangeText={setFullName} 
        style={styles.textInput} 
      />
      <TextInput 
        placeholder='Email' 
        value={email} 
        onChangeText={setEmail} 
        style={styles.textInput} 
        keyboardType='email-address' 
      />
      
      {/* Password Input with Eye Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={withPopSound(() => setShowPassword(!showPassword))}>
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={withPopSound(CreateNewAccount)} 
        disabled={loading} 
        style={styles.button}
      >
        {!loading ? (
          <Text style={styles.buttonText}>Create Account</Text>
        ) : (
          <ActivityIndicator size={'large'} color={'white'} />
        )}
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={withPopSound(() => router.replace('../auth/signIn'))}>
          <Text style={styles.signInLink}>Sign In Here</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#d6eaf8' 
  },
  logo: { 
    width: 100, 
    height: 100, 
    borderRadius: 10 
  },
  title: { 
    marginTop: 10, 
    fontSize: 24, 
    fontFamily: 'outfit-bold' 
  },
  subtitle: { 
    fontSize: 16, 
    fontFamily: 'outfit', 
    color: 'black', 
    marginBottom: 10 
  },
  textInput: { 
    width: '90%', 
    borderWidth: 1, 
    borderRadius: 10, 
    padding: 10, 
    margin: 10, 
    fontSize: 16, 
    color: 'black', 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
  button: { 
    width:'80%',
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 4,
    alignItems: 'center',
    marginVertical:5,
  },
  buttonText: { 
    fontSize: 20, 
    color: 'white', 
    fontFamily: 'outfit-bold', 
    textAlign: 'center' 
  },
  signInContainer: { 
    flexDirection: 'row', 
    marginTop: 5 
  },
  signInText: { 
    fontFamily: 'outfit' 
  },
  signInLink: { 
    color: '#6A5AE0', 
    fontFamily: 'outfit-bold', 
    marginLeft: 5 
  },
});
