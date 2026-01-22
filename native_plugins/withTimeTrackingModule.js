const { withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withTimeTrackingModule(config) {
    return withXcodeProject(config, (config) => {
        const project = config.modResults;

        // 🔑 Get iOS project name dynamically (safe)
        const iosProjectName = config.modRequest.projectName;

        const targetPath = path.join(
            config.modRequest.projectRoot,
            "ios",
            iosProjectName
        );

        const files = [
            'TimeTrackingModule.swift',
            'TimeTrackingModuleHeader.mm'
        ];

        files.forEach((file) => {
            const src = path.resolve(__dirname, '../native_plugins/manual_live_activity/App', file);
            const dest = path.join(targetPath, file);

            fs.copyFileSync(src, dest);

            // Add to the main app target
            // project.addSourceFile(file, { target: project.getFirstTarget().uuid });
        });

        return config;
    });
};
