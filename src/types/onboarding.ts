import { FitnessLevel } from '@/components';

export type PageTitles = "Welcome" | "Location" | "HealthData" | "FirstName" | "Gender" | "Height" | "Weight" | "FitnessLevel" | "DateOfBirth" | "Finished";

export interface OnboardingData {
    firstName: string;
    gender: string;
    height: number;
    heightUnit: 'cm' | 'ft';
    weight?: number;
    weightUnit?: 'kg' | 'lb';
    fitnessLevel: FitnessLevel | null;
    dob: {
        day: string;
        month: string;
        year: string;
    };
}
