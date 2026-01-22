import { CountdownScreen, Exercise } from '@/components';
import { ExerciseType, GoalMetric } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

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
