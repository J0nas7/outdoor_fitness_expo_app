import { MyTheme } from '@/types/theme';
import { useTheme } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';

import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
    const theme = useTheme() as MyTheme;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.success,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="plan"
                options={{
                    title: 'Plan',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="chart-bar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Start',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="bolt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="steps"
                options={{
                    title: 'Steps',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="shoe-prints" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="cog" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
