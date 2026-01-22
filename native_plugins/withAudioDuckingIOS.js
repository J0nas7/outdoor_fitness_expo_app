const { withAppDelegate } = require("@expo/config-plugins");

module.exports = function withAudioDuckingIOS(config) {
    return withAppDelegate(config, (config) => {
        let contents = config.modResults.contents;

        // 1️⃣ Ensure AVFoundation is imported
        if (!contents.includes("import AVFoundation")) {
            contents = contents.replace(
                /import ReactAppDependencyProvider\n/,
                "import ReactAppDependencyProvider\nimport AVFoundation\n"
            );
        }

        // 2️⃣ Inject audio session setup
        const audioSessionCode = `
    // --- Audio ducking for speech ---
    do {
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(
            .playback,
            mode: .spokenAudio,
            options: [.duckOthers]
        )
        try audioSession.setActive(true)
        print("Audio session configured for ducking")
    } catch {
        print("Failed to configure audio session: \\(error)")
    }
    // --- End audio ducking ---
`;

        if (!contents.includes("Audio session configured for ducking")) {
            contents = contents.replace(
                /return super.application\(application, didFinishLaunchingWithOptions: launchOptions\)/,
                `${audioSessionCode}\n    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`
            );
        }

        config.modResults.contents = contents;

        console.log("✅ Added Audio ducking for speech to iOS AppDelegate");

        return config;
    });
};
