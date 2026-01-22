import { BigLogo } from '@/components';
import { MyTheme } from '@/types/theme';
import { useTheme } from '@react-navigation/native';
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

const plan = () => {
    const theme = useTheme() as MyTheme;

    const styles = StyleSheet.create({
        logoContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 30,
        },
        comingSoon: {
            color: theme.colors.success,
            fontSize: 40
        }
    })

    return (
        <View style={styles.logoContainer}>
            <BigLogo size={200} animated={true} />
            <Text style={styles.comingSoon}>Coming soon</Text>
        </View>
    )
}

export default plan
