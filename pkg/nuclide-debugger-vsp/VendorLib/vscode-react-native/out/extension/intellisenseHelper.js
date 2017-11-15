"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const fileSystem_1 = require("../common/node/fileSystem");
const path = require("path");
const Q = require("q");
const vscode = require("vscode");
const semver = require("semver");
const telemetry_1 = require("../common/telemetry");
const telemetryHelper_1 = require("../common/telemetryHelper");
const commandExecutor_1 = require("../common/commandExecutor");
const tsconfigHelper_1 = require("./tsconfigHelper");
const settingsHelper_1 = require("./settingsHelper");
const hostPlatform_1 = require("../common/hostPlatform");
const ConsoleLogger_1 = require("./log/ConsoleLogger");
class IntellisenseHelper {
    /**
     * Helper method that configures the workspace for Salsa intellisense.
     */
    static setupReactNativeIntellisense() {
        // Telemetry - Send Salsa Environment setup information
        const tsSalsaEnvSetup = telemetryHelper_1.TelemetryHelper.createTelemetryEvent("RNIntellisense");
        telemetryHelper_1.TelemetryHelper.addTelemetryEventProperty(tsSalsaEnvSetup, "TsSalsaEnvSetup", !!process.env.VSCODE_TSJS, false);
        telemetry_1.Telemetry.send(tsSalsaEnvSetup);
        const configureWorkspace = tsconfigHelper_1.JsConfigHelper.createJsConfigIfNotPresent()
            .then(() => {
            // VSCode versions >= 1.7.2-insider support ATA and will not require copying
            // typings into workspace for intellisense
            if (semver.lt(vscode.version, IntellisenseHelper.VSCODE_SUPPORTS_ATA_SINCE)) {
                return IntellisenseHelper.installReactNativeTypings();
            }
            return void 0;
        });
        // The actions taken in the promise chain below may result in requring a restart.
        const configureTypescript = Q(false)
            .then((isRestartRequired) => IntellisenseHelper.enableSalsa(isRestartRequired))
            .then((isRestartRequired) => IntellisenseHelper.verifyInstallTypeScript(isRestartRequired))
            .then((isRestartRequired) => IntellisenseHelper.configureWorkspaceSettings(isRestartRequired))
            .then((isRestartRequired) => IntellisenseHelper.warnIfRestartIsRequired(isRestartRequired))
            .catch((err) => {
            IntellisenseHelper.logger.error("Error while setting up IntelliSense: " + err);
            return Q.reject(err);
        });
        /* TODO #83: Refactor this code to
            Q.all([enableSalsa(), installTypescript(), configureWorkspace()])
            .then((result) => warnIfRestartIsRequired(result.any((x) => x)))
        */
        return Q.all([configureWorkspace, configureTypescript]).then(() => { });
    }
    /**
     * Helper method that install typings for React Native.
     */
    static installReactNativeTypings() {
        const typingsSource = path.resolve(__dirname, "..", "..", "ReactTypings");
        const reactTypings = path.resolve(typingsSource, "react");
        const reactNativeTypings = path.resolve(typingsSource, "react-native");
        const typingsIndex = path.resolve(typingsSource, "react-native.d.ts.index");
        const typingsDestination = path.resolve(vscode.workspace.rootPath, ".vscode", "typings");
        const reactTypingsDestination = path.resolve(typingsDestination, "react");
        const reactNativeTypingsDestination = path.resolve(typingsDestination, "react-native");
        const typingsIndexDestination = path.resolve(vscode.workspace.rootPath, "typings");
        const typingIndexFinalPath = path.resolve(typingsIndexDestination, "react-native.d.ts");
        let fileSystem = new fileSystem_1.FileSystem();
        const createTypingsDirectoryIfNeeded = fileSystem.directoryExists(typingsDestination).
            then((exists) => {
            if (!exists) {
                return fileSystem.makeDirectoryRecursiveSync(typingsDestination);
            }
        });
        const copyReactTypingsIfNeeded = fileSystem.directoryExists(reactTypingsDestination)
            .then((exists) => {
            return exists ? void 0 : fileSystem.copyRecursive(reactTypings, reactTypingsDestination);
        });
        const copyReactNativeTypingsIfNeeded = fileSystem.directoryExists(reactNativeTypingsDestination)
            .then((exists) => {
            return exists ? void 0 : fileSystem.copyRecursive(reactNativeTypings, reactNativeTypingsDestination);
        });
        const copyTypingsIndexIfNeeded = fileSystem.directoryExists(typingsIndexDestination)
            .then((exists) => {
            return exists ? null : fileSystem.makeDirectoryRecursiveSync(typingsIndexDestination);
        })
            .then(() => fileSystem.exists(typingIndexFinalPath))
            .then((exists) => {
            return exists ? void 0 : fileSystem.copyFile(typingsIndex, typingIndexFinalPath);
        });
        return Q.all([
            createTypingsDirectoryIfNeeded,
            copyReactTypingsIfNeeded,
            copyReactNativeTypingsIfNeeded,
            copyTypingsIndexIfNeeded,
        ]).then(() => { });
    }
    /**
     * Helper method that verifies the correct version of TypeScript is installed.
     * If using a newer version of VSCode TypeScript is installed by default and no
     * action is needed. If using an older version, verify that the correct TS version is
     * installed, if not install it.
     */
    static verifyInstallTypeScript(isRestartRequired) {
        if (IntellisenseHelper.isSalsaSupported()) {
            // this is the correct version of vscode, which includes TypeScript (Salsa) support, nothing to do here
            return Q.resolve(isRestartRequired);
        }
        return IntellisenseHelper.getInstalledTypeScriptVersion()
            .then(function (installProps) {
            if (installProps.installed === true) {
                if (semver.neq(IntellisenseHelper.s_typeScriptVersion, installProps.version)) {
                    IntellisenseHelper.logger.debug("TypeScript is installed with the wrong version: " + installProps.version);
                    return true;
                }
                else {
                    IntellisenseHelper.logger.debug("Installed TypeScript version is correct");
                    return false;
                }
            }
            else {
                IntellisenseHelper.logger.debug("TypeScript is not installed");
                return true;
            }
        })
            .then((install) => {
            if (install) {
                let installPath = path.resolve(hostPlatform_1.HostPlatform.getUserHomePath(), ".vscode");
                let runArguments = [];
                let npmCommand = hostPlatform_1.HostPlatform.getNpmCliCommand("npm");
                runArguments.push("install");
                runArguments.push("--prefix " + installPath);
                runArguments.push("typescript@" + IntellisenseHelper.s_typeScriptVersion);
                return new commandExecutor_1.CommandExecutor(installPath).spawn(npmCommand, runArguments)
                    .then(() => {
                    return true;
                })
                    .catch((err) => {
                    IntellisenseHelper.logger.error("Error attempting to install TypeScript: " + err);
                    return Q.reject(err);
                });
            }
            else {
                return isRestartRequired;
            }
        });
    }
    static configureWorkspaceSettings(isRestartRequired) {
        let typeScriptLibPath = path.resolve(IntellisenseHelper.getTypeScriptInstallPath(), "lib");
        const tsdkPath = settingsHelper_1.SettingsHelper.getTypeScriptTsdk();
        if (IntellisenseHelper.isSalsaSupported()) {
            if (tsdkPath === typeScriptLibPath) {
                // Note: In previous releases of VSCode (< 0.10.10) the Salsa TypeScript
                // IntelliSense was not enabled by default, this extension would install
                // Salsa itself, and update the settings to point at that. Here we
                // attempt to reset that value to null if it still points to the previous
                // installed (and no longer valid) version of TypeScript.
                settingsHelper_1.SettingsHelper.notifyUserToRemoveTSDKFromSettingsJson(tsdkPath);
                // We are already telling the user to restart. No need to show another message.
                return false;
            }
        }
        else {
            if (tsdkPath === null) {
                settingsHelper_1.SettingsHelper.notifyUserToAddTSDKInSettingsJson(typeScriptLibPath);
                // We are already telling the user to restart. No need to show another message.
                return false;
            }
        }
        return isRestartRequired;
    }
    static warnIfRestartIsRequired(isRestartRequired) {
        if (isRestartRequired) {
            vscode.window.showInformationMessage("React Native intellisense was successfully configured for this project. Restart to enable it.");
        }
        return Q.resolve(void 0);
    }
    /**
     * Helper method that sets the environment variable and informs the user they need to restart
     * in order to enable the Salsa intellisense.
     */
    static enableSalsa(isRestartRequired) {
        if (!IntellisenseHelper.isSalsaSupported() && !process.env.VSCODE_TSJS) {
            return Q({})
                .then(() => hostPlatform_1.HostPlatform.setEnvironmentVariable("VSCODE_TSJS", "1"))
                .then(() => { return true; });
        }
        return Q(isRestartRequired);
    }
    /**
     * Simple check to see if the TypeScript package is in the expected location (where we installed it)
     */
    static isTypeScriptInstalled() {
        let fileSystem = new fileSystem_1.FileSystem();
        let installPath = path.join(IntellisenseHelper.getTypeScriptInstallPath(), "lib");
        return fileSystem.exists(installPath);
    }
    /**
     * Checks for the existance of our installed TypeScript package, if it exists also determine its version
     */
    static getInstalledTypeScriptVersion() {
        return IntellisenseHelper.isTypeScriptInstalled()
            .then((installed) => {
            let installProps = {
                installed: installed,
                version: "",
            };
            if (installed === true) {
                IntellisenseHelper.logger.debug("TypeScript is installed - checking version");
                return IntellisenseHelper.readPackageJson()
                    .then((version) => {
                    installProps.version = version;
                    return installProps;
                });
            }
            else {
                return installProps;
            }
        });
    }
    /**
     * Read the package.json from the TypeScript install path and return the version if it's available
     */
    static readPackageJson() {
        let packageFilePath = path.join(IntellisenseHelper.getTypeScriptInstallPath(), "package.json");
        let fileSystem = new fileSystem_1.FileSystem();
        return fileSystem.exists(packageFilePath)
            .then(function (exists) {
            if (!exists) {
                return Q.reject("package.json not found at:" + packageFilePath);
            }
            return fileSystem.readFile(packageFilePath, "utf-8");
        })
            .then(function (jsonContents) {
            let data = JSON.parse(jsonContents);
            return data.version;
        })
            .catch((err) => {
            IntellisenseHelper.logger.error("Error while processing package.json: " + err);
            return "0.0.0";
        });
    }
    /**
     * Simple helper to get the TypeScript install path
     */
    static getTypeScriptInstallPath() {
        let codePath = path.resolve(hostPlatform_1.HostPlatform.getUserHomePath(), ".vscode");
        let typeScriptLibPath = path.join(codePath, "node_modules", "typescript");
        return typeScriptLibPath;
    }
    /**
     * Simple helper to determine if the current version of VSCode supports TypeScript (Salsa) or better
     */
    static isSalsaSupported() {
        return semver.gte(vscode.version, IntellisenseHelper.s_vsCodeVersion, true);
    }
}
IntellisenseHelper.logger = new ConsoleLogger_1.ConsoleLogger();
IntellisenseHelper.s_typeScriptVersion = "1.8.2"; // preferred version of TypeScript for legacy VSCode installs
IntellisenseHelper.s_vsCodeVersion = "0.10.10-insider"; // preferred version of VSCode (current is 0.10.9, 0.10.10-insider+ will include native TypeScript support)
// note: semver considers "x.x.x-<string>" to be < "x.x.x"" - so we include insider here as the
//       insider build is less than the release build of 0.10.10 and we will support it.
IntellisenseHelper.VSCODE_SUPPORTS_ATA_SINCE = "1.7.2-insider";
exports.IntellisenseHelper = IntellisenseHelper;

//# sourceMappingURL=intellisenseHelper.js.map
