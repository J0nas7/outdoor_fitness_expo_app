import { FinishedExercise } from '@/components';
import { Workout } from "@/types";
import { useLocalSearchParams } from "expo-router";

export default function FinishedExerciseScreen() {
    const { workout } = useLocalSearchParams<{
        workout: string;
    }>();

    const parsedWorkout: Workout = JSON.parse(workout);

    return <FinishedExercise workout={parsedWorkout} />;
}
