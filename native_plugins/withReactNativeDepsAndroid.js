const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withReactNativeDepsAndroid(config) {
    return withAppBuildGradle(config, (config) => {
        let gradle = config.modResults.contents;

        if (!gradle.includes('api("com.facebook.react:react-native")')) {
            gradle = gradle.replace(
                /dependencies\s*{/,
                `dependencies {
    // Added by config plugin to expose React Native to Kotlin modules
    api("com.facebook.react:react-native")`
            );
            console.log("✅ Added React Native API dependency for Kotlin modules");
        }

        config.modResults.contents = gradle;
        return config;
    });
};
