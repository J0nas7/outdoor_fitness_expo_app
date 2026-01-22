import { createStartpageStyles } from '@/styles/modules/StartpageStyles';
import { MyTheme } from '@/types/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

interface MapProps {
    theme: MyTheme;
    location: Location.LocationObject | null
}

export const Map: React.FC<MapProps> = (props) => {
    const styles = createStartpageStyles(props.theme);

    return (
        <View style={styles.mapContainer}>
            {props.location && (
                <>
                    <MapView
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: props.theme.colors.border,
                                opacity: 0.98,
                            }
                        ]}
                        showsUserLocation
                        followsUserLocation
                        initialRegion={{
                            latitude: props.location.coords.latitude,
                            longitude: props.location.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    />

                    {/* Gradient transition */}
                    <LinearGradient
                        colors={['transparent', props.theme.colors.background]}
                        style={styles.mapGradient}
                        locations={[0, 1]}
                        pointerEvents="none"
                    />
                </>
            )}
        </View>
    )
}
