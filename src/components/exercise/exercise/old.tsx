import { Buttons, CountdownScreen, GoalProgress } from '@/components';
import { ExerciseType, GoalMetric, Workout } from '@/types';
import { MyTheme } from '@/types/theme';
import { speak } from "@/utils/native/NativeSpeech";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { getDistance } from 'geolib'; // For distance calculation
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export type ExploreParams = {
    mode: GoalMetric
    distance?: string;
    duration?: string;
    activity: ExerciseType
};

export default function ExploreScreen() {
    const {
        mode,
        distance,
        duration,
        activity,
    } = useLocalSearchParams<ExploreParams>();

    const [isCountingDown, setIsCountingDown] = useState<boolean>(true)

    const parsedDistance =
        mode === 'distance' && distance ? Number(distance) : undefined;

    const parsedDuration =
        mode === 'duration' && duration ? Number(duration) : undefined;

    const exercise = activity;

    const goal =
        mode === 'distance'
            ? parsedDistance
            : parsedDuration;

    return isCountingDown ?
        <CountdownScreen setIsCountingDown={setIsCountingDown} />
        : <Exercise exercise={exercise} goalAmount={goal || 0} goalMetric={mode} />
}

interface ExerciseProps {
    exercise: "Cykling" | "Løb" | "Gågang"
    goalAmount: number
    goalMetric: "duration" | "distance"
}

const Exercise: React.FC<ExerciseProps> = (props) => {
    const theme = useTheme() as MyTheme;
    const [isPaused, setIsPaused] = useState(false); // pause/resume
    const [startTime, setStartTime] = useState<number>(Date.now()); // Start time in milliseconds
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [distance, setDistance] = useState<number>(0); // Distance in meters
    const [elapsedTime, setElapsedTime] = useState<number>(0); // Elapsed time in seconds
    const [pace, setPace] = useState<number>(0); // Elapsed time in seconds
    const [path, setPath] = useState<
        { latitude: number; longitude: number }[]
    >([]);
    const [segments, setSegments] = useState<
        {
            coords: { latitude: number; longitude: number }[];
            pace: number; // m/s
        }[]
    >([]);
    const startPoint = path[0];

    let progress = 0;
    if (props.goalMetric === 'distance') {
        // distance is in meters, goalAmount is in km
        progress = distance / (props.goalAmount * 1000);
    } else if (props.goalMetric === 'duration') {
        // elapsedTime is in seconds, goalAmount is in minutes
        progress = elapsedTime / (props.goalAmount * 60);
    }
    progress = Math.min(progress, 1); // clamp 0 → 1
    const percentage = Math.round(progress * 100);

    const percentageRef = React.useRef(percentage);
    const startTimeRef = React.useRef(startTime);
    const distanceRef = React.useRef(distance);
    const elapsedTimeRef = React.useRef(elapsedTime);
    const paceRef = React.useRef(pace);
    const activeStartTimeRef = React.useRef<number | null>(null);
    const totalActiveMsRef = React.useRef(0);
    const lastSpokenBucketRef = React.useRef(0); // bucket = Math.floor(elapsed / 120)

    const prevLocationRef = React.useRef<Location.LocationObjectCoords | null>(null);
    const prevTimeRef = React.useRef<number | null>(null);
    const pathRef = React.useRef<
        { latitude: number; longitude: number }[]
    >([]);
    const locationSubRef = React.useRef<Location.LocationSubscription | null>(null);

    const mapRef = React.useRef<MapView>(null);

    useEffect(() => { percentageRef.current = percentage; }, [percentage]);
    useEffect(() => { startTimeRef.current = startTime; }, [startTime]);
    useEffect(() => { distanceRef.current = distance; }, [distance]);
    useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
    useEffect(() => { paceRef.current = pace; }, [pace]);

    useFocusEffect(
        React.useCallback(() => {
            // New workout starts
            setStartTime(Date.now());
            setPace(0);
            setPath([]);
            setSegments([]);
            setElapsedTime(0);
            setDistance(0);
            prevLocationRef.current = null;
            pathRef.current = [];

            activeStartTimeRef.current = Date.now();
            lastSpokenBucketRef.current = 0;

            // Speak the message
            setTimeout(() => {
                speak(props.exercise);
                setTimeout(() => {
                    speak(`${props.goalAmount} ${(props.goalMetric === "distance" ? "kilometer" : "minutter")}`);
                }, 1000)
            }, 1000)

            return () => {
                Speech.stop();
            };
        }, [])
    );

    useEffect(() => {
        // === When workout pauses ===
        if (isPaused) {
            prevLocationRef.current = null;
            prevTimeRef.current = null;

            if (activeStartTimeRef.current) {
                totalActiveMsRef.current += Date.now() - activeStartTimeRef.current;
                activeStartTimeRef.current = null;
            }

            return;
        }

        // === Workout starts OR resumes ===
        activeStartTimeRef.current = Date.now();
    }, [isPaused]);

    useEffect(() => {
        if (isPaused) {
            locationSubRef.current?.remove();
            locationSubRef.current = null;
            return;
        }

        let subscription: Location.LocationSubscription | null = null;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000,   // guaranteed wakeups if standing still
                    distanceInterval: 1,
                },
                (loc) => {
                    if (isPaused) return;

                    const elapsed = getElapsedSeconds();
                    setElapsedTime(elapsed);
                    speakProgress(elapsed);

                    if (prevLocationRef.current) {
                        const prev = prevLocationRef.current;
                        const delta = getDistance(
                            { latitude: prev.latitude, longitude: prev.longitude },
                            { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
                        );

                        // filter GPS noise
                        if (delta > 5) {
                            setDistance(d => d + delta);

                            const point = {
                                latitude: loc.coords.latitude,
                                longitude: loc.coords.longitude,
                            };

                            pathRef.current = [...pathRef.current, point];
                            setPath(pathRef.current);

                            const prevPoint = {
                                latitude: prev.latitude,
                                longitude: prev.longitude,
                            };

                            const currPoint = {
                                latitude: loc.coords.latitude,
                                longitude: loc.coords.longitude,
                            };

                            const now = Date.now();
                            const deltaSeconds = (now - (prevTimeRef.current || now)) / 1000; // time between points
                            prevTimeRef.current = now; // update for next segment

                            const segmentPace = delta > 0
                                ? (deltaSeconds / (delta / 1000)) / 60 // minutes per km
                                : 0;

                            setSegments(s => [
                                ...s,
                                { coords: [prevPoint, currPoint], pace: segmentPace },
                            ]);
                        }
                    }

                    if (distanceRef.current > 0 && elapsed > 0) {
                        const km = distanceRef.current / 1000;
                        const minutes = elapsed / 60;
                        setPace(minutes / km);
                    }

                    prevLocationRef.current = loc.coords;
                    setLocation(loc.coords);
                }
            );

            locationSubRef.current = subscription;
        })();

        return () => {
            subscription?.remove();
            locationSubRef.current?.remove();
            locationSubRef.current = null;
        };
    }, [isPaused]);

    if (errorMsg) {
        return <Text>{errorMsg}</Text>;
    }

    // Function to format pace (minutes/km)
    const formatPace = (pace: number): string => {
        if (pace === 0) return "-"; // If no distance is covered, display N/A
        const minutes = Math.floor(pace); // Full minutes
        const seconds = Math.floor((pace - minutes) * 60); // Remaining seconds
        return `${minutes}:${padTime(seconds)}`; // Format as MM:SS
    };

    // Function to format elapsed time as MM:SS or HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${padTime(hours)}:${padTime(minutes)}:${padTime(remainingSeconds)}`;
        } else {
            return `${padTime(minutes)}:${padTime(remainingSeconds)}`;
        }
    };

    // Helper function to pad the time with leading zeros
    const padTime = (time: number): string => {
        return time < 10 ? `0${time}` : `${time}`;
    };

    const paceToColor = (pace: number) => {
        if (pace === 0 || !isFinite(pace)) return '#95a5a6'; // unknown / paused

        if (pace < 5) return '#e74c3c';   // fast (<5:00 min/km) → red
        if (pace < 6) return '#f1c40f';   // moderate (5–6) → yellow
        return '#2ecc71';                 // easy (>6) → green
    };

    const speakProgress = (elapsed: number) => {
        // 2-minute buckets
        const BUCKET_SECONDS = 120;
        const bucket = Math.floor(elapsed / BUCKET_SECONDS);

        if (bucket > lastSpokenBucketRef.current) {
            lastSpokenBucketRef.current = bucket;

            const dist = (distanceRef.current / 1000).toFixed(2);

            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);

            const paceMinutes = Math.floor(paceRef.current);
            const paceSeconds = Math.floor((paceRef.current - paceMinutes) * 60);

            // Only speak every 30 seconds
            speak(
                `Fremskridt ${percentageRef.current} procent, ` +
                `varighed ${hours > 0 ? `${hours} time og ` : ''}${minutes} minutter, ` +
                `distance ${dist} kilometer, ` +
                `tempo ${paceMinutes} minutter og ${paceSeconds} sekunder`
            );
        }
    };

    const getElapsedSeconds = () => {
        const activeMs = activeStartTimeRef.current
            ? Date.now() - activeStartTimeRef.current
            : 0;

        return Math.floor((totalActiveMsRef.current + activeMs) / 1000);
    };

    const stopExercise = async () => {
        locationSubRef.current?.remove();
        locationSubRef.current = null;

        // Show entire route
        if (pathRef.current.length > 1) {
            mapRef.current?.fitToCoordinates(pathRef.current, {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true,
            });
        }

        // Save workout to AsyncStorage
        const workoutData: Workout = {
            id: Date.now(),
            exercise: props.exercise,
            goalAmount: props.goalAmount,
            goalMetric: props.goalMetric,
            percentage,
            startTime: startTimeRef.current,
            endTime: Date.now(),
            distance: distanceRef.current,
            elapsedTime: elapsedTimeRef.current,
            pace: paceRef.current,
            path: pathRef.current,
            segments,
        };

        try {
            const storedWorkouts = await AsyncStorage.getItem('workouts');
            const workouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];
            workouts.push(workoutData);
            await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
            console.log('Workout saved successfully!');
            router.replace({
                pathname: "/finished-exercise",
                params: {
                    workout: JSON.stringify(workoutData),
                },
            });
        } catch (error) {
            console.error('Error saving workout', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
        },
        mapContainer: {
            height: '60%', // Map takes 60% of the screen
        },
        map: {
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.border,
        },
        statsContainer: {
            height: '40%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            paddingVertical: 20,
            paddingHorizontal: 15,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 5,
            shadowColor: theme.colors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap', // Allows the items to wrap onto new lines
            justifyContent: 'space-evenly', // Even spacing between items
            width: '100%',
        },
        statItem: {
            width: '30%', // 3 items per row (100% / 3 = 33.33%, rounded to 30% for spacing)
            alignItems: 'center',
            marginBottom: 20, // Space between rows
        },
        valueText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.secondaryText,
        },
        unitText: {
            fontSize: 14,
            color: theme.colors.tertiaryText, // Lighter color for units
        },
        goalOverlay: {
            position: 'absolute',
            top: '60%', // slightly above the split (70/30)
            left: '50%',
            transform: [
                { translateX: -70 },
                { translateY: -70 },
            ],
            zIndex: 10,
            elevation: 10, // Android
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    followsUserLocation={true}
                    showsUserLocation={true}
                    region={{
                        latitude: location?.latitude || 0,
                        longitude: location?.longitude || 0,
                        latitudeDelta: 0.005, // Smaller value for more zoomed in
                        longitudeDelta: 0.005,
                    }}
                >
                    {segments.map((seg, idx) => (
                        <Polyline
                            key={idx}
                            coordinates={seg.coords}
                            strokeColor={paceToColor(seg.pace)}
                            strokeWidth={4}
                        />
                    ))}
                    {startPoint && (
                        <Marker
                            coordinate={startPoint}
                            title="Start"
                            pinColor="green"
                        />
                    )}
                </MapView>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.grid}>
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>{((distance) / 1000).toFixed(2)} </Text>
                        <Text style={styles.unitText}>km</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>{formatTime(elapsedTime)}</Text>
                        <Text style={styles.unitText}>Time</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>{formatPace(pace)}</Text>
                        <Text style={styles.unitText}>min/km</Text>
                    </View>

                    {/* Placeholder stats */}
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>0</Text>
                        <Text style={styles.unitText}>Steps</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>0</Text>
                        <Text style={styles.unitText}>Kcal</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.valueText}>0</Text>
                        <Text style={styles.unitText}>bpm</Text>
                    </View>
                </View>

                <Buttons
                    isPaused={isPaused}
                    setIsPaused={setIsPaused}
                    stopExercise={stopExercise}
                />
            </View>

            <View style={styles.goalOverlay}>
                <GoalProgress
                    percentage={percentage}
                    goalAmount={props.goalAmount}
                    goalMetric={props.goalMetric}
                />
            </View>
        </View>
    );
}
