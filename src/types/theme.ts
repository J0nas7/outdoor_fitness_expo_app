import { DefaultTheme as NavigationTheme } from '@react-navigation/native';

// Extend the theme type
export type MyTheme = typeof NavigationTheme & {
    colors: typeof NavigationTheme['colors'] & {
        success: string;
        onPrimary: string;
        surface: string;
        secondaryText: string;
        tertiaryText: string;
        overlay: string;
    };
};
