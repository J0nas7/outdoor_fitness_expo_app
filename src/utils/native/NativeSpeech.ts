import { NativeModules, Platform } from "react-native";

const BackgroundSpeechIOS = NativeModules.BackgroundSpeechIOS;
const BackgroundSpeechAndroid = NativeModules.BackgroundSpeechAndroid;

export const startSpeechService = () => {
    if (Platform.OS === "android" && BackgroundSpeechAndroid) {
        BackgroundSpeechAndroid.startService?.();
    }
};

export const stopSpeechService = () => {
    if (Platform.OS === "android" && BackgroundSpeechAndroid) {
        BackgroundSpeechAndroid.stopService?.();
    }
};

export const speak = (text: string) => {
    if (Platform.OS === "ios" && BackgroundSpeechIOS) {
        BackgroundSpeechIOS.speak(text);
    } else if (Platform.OS === "android" && BackgroundSpeechAndroid) {
        BackgroundSpeechAndroid.speak(text);
    } else {
        console.warn("Speech not supported on this platform");
    }
};

export const stopSpeak = () => {
    if (Platform.OS === "ios" && BackgroundSpeechIOS) {
        BackgroundSpeechIOS.stop?.();
    } else if (Platform.OS === "android" && BackgroundSpeechAndroid) {
        BackgroundSpeechAndroid.stop?.();
    }
};
