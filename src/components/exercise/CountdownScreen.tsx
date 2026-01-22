import { MyTheme } from '@/types/theme';
import { speak } from "@/utils/native/NativeSpeech";
import { useFocusEffect, useTheme } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { Animated as RNAnimated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CountdownScreenProps {
    setIsCountingDown: React.Dispatch<React.SetStateAction<boolean>>
}

export const CountdownScreen: React.FC<CountdownScreenProps> = (props) => {
    const theme = useTheme() as MyTheme;
    const [number, setNumber] = useState(5);
    const animation = React.useRef(new RNAnimated.Value(0)).current;

    const radius = 100;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;

    // Create Animated version of Circle
    const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

    // Animate circle from 0 to 100%
    const animateCircle = () => {
        animation.setValue(0);
        RNAnimated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };

    useFocusEffect(
        React.useCallback(() => {
            speak("Fem");
            setNumber(5)
            animateCircle();

            const timers = [
                setTimeout(() => {
                    speak("Fire");
                    setNumber(4)
                    animateCircle();
                }, 1500),
                setTimeout(() => {
                    speak("Tre");
                    setNumber(3)
                    animateCircle();
                }, 2500),
                setTimeout(() => {
                    speak("To");
                    setNumber(2)
                    animateCircle();
                }, 3500),
                setTimeout(() => {
                    speak("En");
                    setNumber(1)
                    animateCircle();

                    setTimeout(() => {
                        props.setIsCountingDown(false)
                    }, 1000)
                }, 4500)
            ]

            // Cleanup on blur
            return () => {
                Speech.stop();
                timers.forEach(timer => clearTimeout(timer));
            };
        }, [])
    );

    // Interpolate strokeDashoffset for the circle animation
    const strokeDashoffset = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent'
        },
        number: {
            position: 'absolute',
            fontSize: 100,
            color: theme.colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <Svg
                height={radius * 2 + strokeWidth * 2}
                width={radius * 2 + strokeWidth * 2}
            >
                <AnimatedCircle
                    stroke="green"
                    fill="transparent"
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={radius + strokeWidth}
                    originY={radius + strokeWidth}
                />
            </Svg>

            <Text style={styles.number}>{number}</Text>
        </View>
    );
}
