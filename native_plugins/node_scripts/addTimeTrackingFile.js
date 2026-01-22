// native_plugins/node_scripts/addTimeTrackingFile.js

const fs = require('fs');
const path = require('path');
const xcode = require('xcode');

// === CONFIGURATION ===
const iosFolder = path.resolve(__dirname, '../../ios');
const swiftFileName = 'TimeTrackingPlayerAttributes.swift';
const srcSwiftPath = path.resolve(__dirname, '../../targets/TimeTrackingPlayer', swiftFileName);
const destSwiftPath = path.join(iosFolder, swiftFileName);

// === COPY SWIFT FILE ===
fs.copyFileSync(srcSwiftPath, destSwiftPath);
console.log(`Copied ${swiftFileName} to ios folder.`);

// === DETECT XCODE PROJECT NAME ===
const xcodeProjFolders = fs.readdirSync(iosFolder).filter((f) => f.endsWith('.xcodeproj'));
if (xcodeProjFolders.length === 0) {
    console.error('❌ No .xcodeproj folder found in ios directory!');
    process.exit(1);
}
const projectName = xcodeProjFolders[0].replace('.xcodeproj', '');
console.log(`Detected Xcode project: ${projectName}`);

// === LOAD XCODE PROJECT ===
const projectPath = path.join(iosFolder, `${projectName}.xcodeproj/project.pbxproj`);
const project = xcode.project(projectPath);
project.parseSync();

// === GET MAIN GROUP ===
const mainGroupKey = project.getFirstProject().firstProject.mainGroup;

// === GET FIRST TARGET ===
const target = project.getFirstTarget().uuid;

// === CHECK IF FILE ALREADY EXISTS ===
const fileAlreadyAdded = Object.values(project.hash.project.objects.PBXFileReference || {}).some(
    (f) => f.path === swiftFileName
);

if (!fileAlreadyAdded) {
    // Add the Swift file to the main group and target
    project.addSourceFile(swiftFileName, { target }, mainGroupKey);
    console.log(`Added ${swiftFileName} to Xcode target.`);
} else {
    console.log(`${swiftFileName} is already added to the Xcode project. Skipping.`);
}

// === SAVE PROJECT ===
fs.writeFileSync(projectPath, project.writeSync());
console.log('✅ Xcode project updated successfully!');
