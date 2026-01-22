const { withInfoPlist } = require("@expo/config-plugins");

module.exports = function withLiveActivitiesIOS(config) {
    return withInfoPlist(config, (config) => {
        const plist = config.modResults;

        // Add Live Activities keys
        plist.UIApplicationSupportsLiveActivities = true;
        plist.NSSupportsLiveActivities = true;

        console.log("✅ Added Live Activity keys to Info.plist");

        return config;
    });
};
