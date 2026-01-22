import { MyTheme } from '@/types/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const createOnboardingStyles = (theme: MyTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        page: {
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
        },
        center: {
            alignItems: 'center',
            gap: 20
        },
        title: {
            fontSize: 28,
            fontWeight: '600',
            color: theme.colors.text,
        },
        value: {
            fontSize: 22,
            color: theme.colors.text,
        },
        nextButton: {
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 12,
        },
        nextButtonActive: {
            backgroundColor: theme.colors.success,
            opacity: 1
        },
        nextButtonInactive: {
            backgroundColor: theme.colors.border,
            opacity: 0.5
        },
        nextButtonText: {
            color: theme.colors.onPrimary,
            fontSize: 18,
            fontWeight: 'bold'
        },

        /** ─────────────────────────
         * Height / value controls
         * ───────────────────────── */
        valueRow: {
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        roundButton: {
            width: 40,
            height: 40,
            borderRadius: "100%",
            backgroundColor: theme.colors.text,
            alignItems: 'center',
            justifyContent: 'center',
        },

        roundButtonText: {
            color: theme.colors.background,
            fontSize: 25,
            fontWeight: 700,
        },

        slider: {
            width: width * 0.8,
        },

        /** ─────────────────────────
         * Toggle
         * ───────────────────────── */
        toggleContainer: { flexDirection: 'row', gap: 10 },
        toggleButton: {
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 8,
        },
        toggleActive: {},
        toggleText: {
            color: theme.colors.text
        },
        toggleTextActive: {},


        selectRow: {
            width: 220,
            padding: 14,
            borderWidth: 1,
            borderRadius: 8,
            alignItems: 'center',
        },
        selectText: {
            fontSize: 16,
            color: theme.colors.text
        },
        modalBackdrop: { flex: 1 },
        modalContainer: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
        },
        modalItem: { paddingVertical: 14 },
        modalItemText: { fontSize: 18, textAlign: 'center' },
    });
