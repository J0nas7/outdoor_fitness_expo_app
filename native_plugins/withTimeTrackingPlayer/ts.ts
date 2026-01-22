import { NativeModules } from 'react-native';

const { LiveActivityModule } = NativeModules;

export function startCountdown(seconds: number) {
    LiveActivityModule.startCountdown(seconds);
}
