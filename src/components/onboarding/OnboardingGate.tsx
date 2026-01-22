import { hasCompletedOnboarding } from '@/utils/onboarding';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';

export const OnboardingGate = () => {
    useFocusEffect(
        useCallback(() => {
            const check = async () => {
                const done = await hasCompletedOnboarding();

                if (!done) {
                    router.replace('/onboarding');
                }
            };

            check();
        }, [])
    );

    return null;
}
