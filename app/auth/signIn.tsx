import { View, Text, Image, StyleSheet, TouchableOpacity, ToastAndroid, TextInput, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { UserDetailContext } from '@/config/UserDetailContext';
import Colors from '@/constants/Colors';
import useBackHandler from "@/constants/useBackHandler";
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons for eye icon

export default function SignIn() {
  useBackHandler();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const onSignInClick = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (resp) => {
        console.log(resp.user);
        await getUserDetails();
        setLoading(false);
        router.replace('../Home');
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
        ToastAndroid.show('Incorrect Email or Password', ToastAndroid.BOTTOM);
      });
  };

  const getUserDetails = async () => {
    const result = await getDoc(doc(db, 'users', email));
    setUserDetail(result.data());
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue your learning journey.</Text>

      <TextInput 
        placeholder='Email'
        onChangeText={setEmail}
        value={email}
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
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onSignInClick} disabled={loading} style={styles.button}>
        {!loading ? <Text style={styles.buttonText}>Sign In</Text> : 
          <ActivityIndicator size={'large'} color={'white'} />}
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.replace('../auth/singUp')}>
          <Text style={styles.signUpLink}>Sign Up Here</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    color: 'black' 
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
  signUpContainer: { 
    flexDirection: 'row', 
    marginTop: 5 
  },
  signUpText: { 
    fontFamily: 'outfit' 
  },
  signUpLink: { 
    color: '#6A5AE0',
    fontFamily: 'outfit-bold', 
    marginLeft: 5 
  },
});
