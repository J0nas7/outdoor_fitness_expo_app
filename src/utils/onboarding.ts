import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hasCompletedOnboarding';

export const hasCompletedOnboarding = async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'true';
};

export const setOnboardingCompleted = async () => {
    await AsyncStorage.setItem(KEY, 'true');
};
