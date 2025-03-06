import { useEffect } from "react";
import { BackHandler, Alert } from "react-native";

const useBackHandler = () => {
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit the app?",
        [
          {
            text: "No",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Yes", onPress: () => BackHandler.exitApp() },
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
