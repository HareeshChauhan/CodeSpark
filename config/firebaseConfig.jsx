import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence,
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6HjFbC9FkjGsGDa0gWlWfQjAcH05hxNg",
  authDomain: "techtutor-aa308.firebaseapp.com",
  projectId: "techtutor-aa308",
  storageBucket: "techtutor-aa308.appspot.com",
  messagingSenderId: "970090134103",
  appId: "1:970090134103:web:755274ff04a3ea8da9c112",
  measurementId: "G-PH1P2QCSF6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configure Firebase Auth persistence
const auth =
  Platform.OS === "web"
? getAuth(app)  // Default auth for web
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage), // Using AsyncStorage for React Native
      });

const db = getFirestore(app);

export { auth, db, app };
