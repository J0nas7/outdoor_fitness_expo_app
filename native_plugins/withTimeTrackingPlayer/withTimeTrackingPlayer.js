const {
    withInfoPlist,
    withXcodeProject,
    withEntitlementsPlist,
    createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const LIVE_ACTIVITY_GROUP = "group.com.yourapp.liveactivity";

const withTimeTrackingPlayer = (config) => {
    // 1️⃣ Add NSUserActivityTypes
    /*config = withInfoPlist(config, (config) => {
        config.modResults.NSUserActivityTypes = [
            ...(config.modResults.NSUserActivityTypes || []),
            "com.yourapp.liveactivity.Countdown",
        ];
        return config;
    });*/

    // 2️⃣ Add entitlements for Live Activities and App Group
    config = withEntitlementsPlist(config, (config) => {
        // Live Activities capability
        config.modResults["com.apple.developer.live-activities"] = true;

        // App Group
        const groups = config.modResults["com.apple.security.application-groups"] || [];
        if (!groups.includes(LIVE_ACTIVITY_GROUP)) {
            groups.push(LIVE_ACTIVITY_GROUP);
        }
        config.modResults["com.apple.security.application-groups"] = groups;

        return config;
    });

    // 3️⃣ Copy Swift files to iOS app target
    config = withXcodeProject(config, (config) => {
        const project = config.modResults;

        // Ensure first target exists
        const target = project.getFirstTarget();
        if (!target) {
            console.warn("⚠️ Could not find Xcode target. Skipping Swift file addition.");
            return config;
        }

        const pluginSwiftPath = path.join(__dirname, "Swift");

        if (!fs.existsSync(pluginSwiftPath)) {
            return config;
        }

        // 🔑 Get iOS project name dynamically (safe)
        const iosProjectName = config.modRequest.projectName;

        const targetPath = path.join(
            config.modRequest.projectRoot,
            "ios",
            iosProjectName,
            "TimeTrackingPlayer"
        );

        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        const files = fs.readdirSync(pluginSwiftPath);

        for (const file of files) {
            const src = path.join(pluginSwiftPath, file);
            const dest = path.join(targetPath, file);

            fs.copyFileSync(src, dest);

            // Use project path relative to Xcode project
            const filePathInXcode = path.relative(
                path.join(config.modRequest.projectRoot, "ios"),
                dest
            );

            // ✅ Add the Swift file to the Xcode project target
            // project.addSourceFile(filePathInXcode, { target: target.uuid });
        }

        return config;
    });

    return config;
};

module.exports = createRunOncePlugin(
    withTimeTrackingPlayer,
    "with-live-activity-countdown",
    "1.0.0"
);
