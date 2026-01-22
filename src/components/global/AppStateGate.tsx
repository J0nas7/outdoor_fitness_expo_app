import { BigLogo } from '@/components/global/BigLogo';
import { MyTheme } from '@/types/theme';
import { hasCompletedOnboarding } from '@/utils/onboarding';
import { useTheme } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

interface AppStateGateProps {
    children: React.ReactNode
}

export const AppStateGate: React.FC<AppStateGateProps> = (props) => {
    const theme = useTheme() as MyTheme;

    const [appState, setAppState] = useState(AppState.currentState);
    const [showLockScreen, setShowLockScreen] = useState(false);
    const appStateRef = useRef(appState);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            (async () => {
                const onboarded = await hasCompletedOnboarding();

                if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
                    setShowLockScreen(false); // hide "app-pause" screen
                }

                if (onboarded && nextAppState.match(/inactive|background/)) {
                    setShowLockScreen(true); // show "app-pause" screen
                }

                appStateRef.current = nextAppState;
                setAppState(nextAppState);
            })();
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const styles = StyleSheet.create({
        lockScreen: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.colors.background, // could use blur effect or custom overlay
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        }
    });

    // Render children normally, or overlay lock screen
    return (
        <>
            {props.children}
            {showLockScreen && (
                <View style={styles.lockScreen}>
                    <BigLogo size={200} />
                </View>
            )}
        </>
    );
}
