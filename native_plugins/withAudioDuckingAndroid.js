const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withAudioDuckingAndroid(config) {
    return withMainActivity(config, (config) => {
        let contents = config.modResults.contents;

        // 1️⃣ Ensure AudioManager imports exist
        if (!contents.includes("import android.media.AudioManager;")) {
            contents = contents.replace(
                /import android.os.Bundle;\n/,
                `import android.os.Bundle;\nimport android.media.AudioManager;\nimport android.media.AudioFocusRequest;\n`
            );
        }

        // 2️⃣ Inject audio focus request
        const audioFocusCode = `
    // --- Audio ducking for speech ---
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    if (audioManager != null) {
        AudioFocusRequest focusRequest = new AudioFocusRequest.Builder(
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
        ).build();
        audioManager.requestAudioFocus(focusRequest);
    }
    // --- End audio ducking ---
`;

        if (!contents.includes("Audio ducking for speech")) {
            contents = contents.replace(
                /super\.onCreate\(savedInstanceState\);/,
                `super.onCreate(savedInstanceState);\n${audioFocusCode}`
            );
        }

        config.modResults.contents = contents;

        console.log("✅ Added Audio ducking for speech to Android MainActivity");

        return config;
    });
};
