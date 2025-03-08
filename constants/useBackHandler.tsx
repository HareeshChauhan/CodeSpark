import { useEffect } from "react";
import { BackHandler, Alert } from "react-native";
import { Audio } from "expo-av";

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

const useBackHandler = () => {
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit the app?",
        [
          {
            text: "No",
            onPress: async () => {
              await playPopSound();
              // Do nothing else on "No"
            },
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              await playPopSound();
              BackHandler.exitApp();
            },
          },
        ],
        { cancelable: false }
      );
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
};

export default useBackHandler;
