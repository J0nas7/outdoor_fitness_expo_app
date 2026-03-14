// native_plugins/withAndroidSetup.js
const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidSetup(config) {
    return withAppBuildGradle(config, (config) => {
        let gradle = config.modResults.contents;

        // 1️⃣ Add React Native API dependency for Kotlin modules
        if (!gradle.includes('api("com.facebook.react:react-native")')) {
            gradle = gradle.replace(
                /dependencies\s*{/,
                `dependencies {
    // Added by config plugin to expose React Native to Kotlin modules
    api("com.facebook.react:react-native")`
            );
            console.log("✅ Added React Native API dependency for Kotlin modules");
        }

        // 2️⃣ Add kotlinOptions properly using afterEvaluate
        if (!gradle.includes("kotlinOptions")) {
            const kotlinOptionsSnippet = `
afterEvaluate {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
}`;
            gradle += kotlinOptionsSnippet;
            console.log("✅ Added kotlinOptions with jvmTarget 17 via afterEvaluate");
        }

        config.modResults.contents = gradle;
        return config;
    });
};
