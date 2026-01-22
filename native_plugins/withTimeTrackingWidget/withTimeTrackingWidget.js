const { withXcodeProject } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const WIDGET_NAME = "TimeTrackingPlayer";
const BUNDLE_SUFFIX = "timetrackingplayer";

module.exports = function withTimeTrackingWidget(config) {
    return withXcodeProject(config, (config) => {
        const project = config.modResults;

        // Prevent duplicate targets
        if (project.pbxTargetByName(WIDGET_NAME)) {
            return config;
        }

        // Create the widget extension target
        const target = project.addTarget(
            WIDGET_NAME,
            "app_extension",
            WIDGET_NAME,
            "com.apple.product-type.app-extension"
        );

        // Create build configuration list
        project.addBuildConfiguration(
            "Debug",
            {
                PRODUCT_NAME: `"${WIDGET_NAME}"`,
                INFOPLIST_FILE: `"targets/${WIDGET_NAME}/Info.plist"`,
                SKIP_INSTALL: "YES",
                CODE_SIGN_STYLE: "Automatic",
                DEVELOPMENT_TEAM: project.getFirstProject().firstProject.developmentTeam,
            },
            target.uuid
        );

        project.addBuildConfiguration(
            "Release",
            {
                PRODUCT_NAME: `"${WIDGET_NAME}"`,
                INFOPLIST_FILE: `"targets/${WIDGET_NAME}/Info.plist"`,
                SKIP_INSTALL: "YES",
                CODE_SIGN_STYLE: "Automatic",
                DEVELOPMENT_TEAM: project.getFirstProject().firstProject.developmentTeam,
            },
            target.uuid
        );

        // Add widget source files
        const widgetPath = path.join(
            config.modRequest.projectRoot,
            "targets",
            WIDGET_NAME
        );

        project.addSourceFile(
            `targets/${WIDGET_NAME}/TimeTrackingPlayer.swift`,
            null,
            target.uuid
        );

        project.addResourceFile(
            `targets/${WIDGET_NAME}/Info.plist`,
            null,
            target.uuid
        );

        return config;
    });
};
