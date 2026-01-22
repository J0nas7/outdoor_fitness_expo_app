import { DateOfBirthPage, Finished, FirstNamePage, FitnessLevel, FitnessLevelPage, GenderPage, HealthDataPage, HeightPage, LocationPage, SelectModal, WeightPage, Welcome } from '@/components';
import { createOnboardingStyles } from '@/styles/modules/OnboardingStyles';
import { PageTitles } from '@/types';
import { MyTheme } from '@/types/theme';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const theme = useTheme() as MyTheme;
    const onboardingStyles = createOnboardingStyles(theme);
    const scrollX = useRef(new Animated.Value(0)).current;
    const listRef = useRef<Animated.FlatList<any>>(null);
    const currentIndex = useRef(0);
    const [currentPage, setCurrentPage] = useState<PageTitles>("Welcome");

    // ---------------- State ----------------
    const [firstName, setFirstName] = useState('');

    const [gender, setGender] = useState('Select gender');
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [height, setHeight] = useState(170);

    const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
    const [weight, setWeight] = useState(60);

    const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);

    const [dobModal, setDobModal] = useState<null | 'day' | 'month' | 'year'>(null);
    const [day, setDay] = useState('Day');
    const [month, setMonth] = useState('Month');
    const [year, setYear] = useState('Year');

    const [completed, setCompleted] = useState(false);

    const goToNextPage = (pageName: PageTitles) => {
        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        currentIndex.current += 1;
        setCurrentPage(pageName);

        listRef.current?.scrollToOffset({
            offset: currentIndex.current * width,
            animated: true,
        });
    };

    const pages = [
        <Welcome onNext={goToNextPage} />,
        <LocationPage {...{ theme, currentPage, onNext: goToNextPage }} />,
        <HealthDataPage {...{ theme, currentPage, onNext: goToNextPage }} />,
        <FirstNamePage {...{ theme, currentPage, firstName, setFirstName, onNext: goToNextPage }} />,
        <GenderPage {...{ theme, gender, setGenderModalVisible }} />,
        <HeightPage {...{ theme, height, setHeight, heightUnit, setHeightUnit, onNext: goToNextPage }} />,
        <WeightPage {...{ theme, weight, setWeight, weightUnit, setWeightUnit, onNext: goToNextPage }} />,
        <FitnessLevelPage {...{ theme, fitnessLevel, setFitnessLevel, onNext: goToNextPage }} />,
        <DateOfBirthPage {...{ theme, day, month, year, setDay, setMonth, setYear, setCompleted, onNext: goToNextPage }} />,
        <Finished {...{ completed, currentPage, firstName, gender, height, heightUnit, fitnessLevel, day, month, year }} />,
    ];

    return (
        <View style={[onboardingStyles.container, { backgroundColor: theme.colors.background }]}>
            <Animated.FlatList
                ref={listRef}
                data={pages}
                keyExtractor={(_, i) => i.toString()}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item, index }) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.9, 1, 0.9],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.5, 1, 0.5],
                    });

                    return (
                        <Animated.View
                            style={[
                                onboardingStyles.page,
                                { transform: [{ scale }], opacity },
                            ]}
                        >
                            {item}
                        </Animated.View>
                    );
                }}
            />

            {/* ---------------- Modals ---------------- */}
            <SelectModal
                visible={genderModalVisible}
                items={['Male', 'Female', 'Other']}
                theme={theme}
                onSelect={(v) => {
                    setGender(v);
                    setGenderModalVisible(false);
                    goToNextPage("Height");
                }}
                onClose={() => setGenderModalVisible(false)}
            />
        </View>
    );
}
