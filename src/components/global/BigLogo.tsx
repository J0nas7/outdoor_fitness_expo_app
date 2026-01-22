import { OnboardingData } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'

interface BigLogoProps {
    size: number
    icon?: string
    animated?: boolean
}

export const BigLogo: React.FC<BigLogoProps> = (props) => {
    const [LOGO, setLogo] = useState<string>(props.icon || "🏃‍♀️")

    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Animate icon scale
    useEffect(() => {
        if (props.animated) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [scaleAnim]);

    useEffect(() => {
        (async () => {
            if (props.icon) return

            const STORAGE_KEY = 'onboardingData';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (!stored) return;

            const data: OnboardingData = JSON.parse(stored);

            if (data.gender) setLogo(data.gender === "Male" ? "🏃" : "🏃‍♀️")
        })();
    }, [])

    const styles = StyleSheet.create({
        icon: {
            fontSize: props.size,
        }
    })

    if (props.animated) {
        return (
            <Animated.Text style={[styles.icon, { transform: [{ scale: scaleAnim }] }]}>
                {LOGO}
            </Animated.Text>
        )
    }

    return <Text style={styles.icon}>{LOGO}</Text>
}
