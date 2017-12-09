"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Q = require("q");
const XDL = require("./exponent/xdlInterface");
const settingsHelper_1 = require("./settingsHelper");
const OutputChannelLogger_1 = require("./log/OutputChannelLogger");
const packager_1 = require("../common/packager");
const androidPlatform_1 = require("./android/androidPlatform");
const iOSPlatform_1 = require("./ios/iOSPlatform");
const packagerStatusIndicator_1 = require("./packagerStatusIndicator");
const reactNativeProjectHelper_1 = require("../common/reactNativeProjectHelper");
const targetPlatformHelper_1 = require("../common/targetPlatformHelper");
const telemetryHelper_1 = require("../common/telemetryHelper");
class CommandPaletteHandler {
    constructor(workspaceRoot, reactNativePackager, packagerStatusIndicator, exponentHelper) {
        this.logger = OutputChannelLogger_1.OutputChannelLogger.getMainChannel();
        this.workspaceRoot = workspaceRoot;
        this.reactNativePackager = reactNativePackager;
        this.reactNativePackageStatusIndicator = packagerStatusIndicator;
        this.exponentHelper = exponentHelper;
    }
    /**
     * Starts the React Native packager
     */
    startPackager() {
        return this.executeCommandInContext("startPackager", () => this.reactNativePackager.isRunning()
            .then((running) => {
            return running ? this.reactNativePackager.stop() : Q.resolve(void 0);
        }))
            .then(() => this.runStartPackagerCommandAndUpdateStatus());
    }
    /**
     * Starts the Exponent packager
     */
    startExponentPackager() {
        return this.executeCommandInContext("startExponentPackager", () => this.reactNativePackager.isRunning()
            .then((running) => {
            return running ? this.reactNativePackager.stop() : Q.resolve(void 0);
        })).then(() => this.exponentHelper.configureExponentEnvironment()).then(() => this.runStartPackagerCommandAndUpdateStatus(packager_1.PackagerRunAs.EXPONENT));
    }
    /**
     * Kills the React Native packager invoked by the extension's packager
     */
    stopPackager() {
        return this.executeCommandInContext("stopPackager", () => this.reactNativePackager.stop())
            .then(() => this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.PACKAGER_STOPPED));
    }
    /**
     * Restarts the React Native packager
     */
    restartPackager() {
        return this.executeCommandInContext("restartPackager", () => this.runRestartPackagerCommandAndUpdateStatus());
    }
    /**
     * Execute command to publish to exponent host.
     */
    publishToExpHost() {
        return this.executeCommandInContext("publishToExpHost", () => {
            return this.executePublishToExpHost().then((didPublish) => {
                if (!didPublish) {
                    this.logger.warning("Publishing was unsuccessful. Please make sure you are logged in Exponent and your project is a valid Exponentjs project");
                }
            });
        });
    }
    /**
     * Executes the 'react-native run-android' command
     */
    runAndroid(target = "simulator") {
        targetPlatformHelper_1.TargetPlatformHelper.checkTargetPlatformSupport("android");
        return this.executeCommandInContext("runAndroid", () => this.executeWithPackagerRunning(() => {
            const packagerPort = settingsHelper_1.SettingsHelper.getPackagerPort();
            const runArgs = settingsHelper_1.SettingsHelper.getRunArgs("android", target);
            const platform = new androidPlatform_1.AndroidPlatform({ platform: "android", projectRoot: this.workspaceRoot, packagerPort: packagerPort, runArguments: runArgs }, {
                packager: this.reactNativePackager,
                packageStatusIndicator: this.reactNativePackageStatusIndicator,
            });
            return platform.runApp(/*shouldLaunchInAllDevices*/ true)
                .then(() => {
                return platform.disableJSDebuggingMode();
            });
        }));
    }
    /**
     * Executes the 'react-native run-ios' command
     */
    runIos(target = "simulator") {
        targetPlatformHelper_1.TargetPlatformHelper.checkTargetPlatformSupport("ios");
        return this.executeCommandInContext("runIos", () => this.executeWithPackagerRunning(() => {
            const packagerPort = settingsHelper_1.SettingsHelper.getPackagerPort();
            const runArgs = settingsHelper_1.SettingsHelper.getRunArgs("ios", target);
            const platform = new iOSPlatform_1.IOSPlatform({ platform: "ios", projectRoot: this.workspaceRoot, packagerPort, runArguments: runArgs }, { packager: this.reactNativePackager, packageStatusIndicator: this.reactNativePackageStatusIndicator });
            // Set the Debugging setting to disabled, because in iOS it's persisted across runs of the app
            return platform.disableJSDebuggingMode()
                .catch(() => { }) // If setting the debugging mode fails, we ignore the error and we run the run ios command anyways
                .then(() => {
                return platform.runApp();
            });
        }));
    }
    showDevMenu() {
        androidPlatform_1.AndroidPlatform.showDevMenu()
            .catch(() => { }); // Ignore any errors
        iOSPlatform_1.IOSPlatform.showDevMenu()
            .catch(() => { }); // Ignore any errors
        return Q.resolve(void 0);
    }
    reloadApp() {
        androidPlatform_1.AndroidPlatform.reloadApp()
            .catch(() => { }); // Ignore any errors
        iOSPlatform_1.IOSPlatform.reloadApp()
            .catch(() => { }); // Ignore any errors
        return Q.resolve(void 0);
    }
    runRestartPackagerCommandAndUpdateStatus() {
        return this.reactNativePackager.restart(settingsHelper_1.SettingsHelper.getPackagerPort())
            .then(() => this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.PACKAGER_STARTED));
    }
    /**
     * Helper method to run packager and update appropriate configurations
     */
    runStartPackagerCommandAndUpdateStatus(startAs = packager_1.PackagerRunAs.REACT_NATIVE) {
        if (startAs === packager_1.PackagerRunAs.EXPONENT) {
            return this.loginToExponent()
                .then(() => this.reactNativePackager.startAsExponent()).then(exponentUrl => {
                this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.EXPONENT_PACKAGER_STARTED);
                this.logger.info("Application is running on Exponent.");
                const exponentOutput = `Open your exponent app at ${exponentUrl}`;
                this.logger.info(exponentOutput);
                vscode.commands.executeCommand("vscode.previewHtml", vscode.Uri.parse(exponentUrl), 1, "Expo QR code");
            });
        }
        return this.reactNativePackager.startAsReactNative()
            .then(() => this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.PACKAGER_STARTED));
    }
    /**
     * Executes a lambda function after starting the packager
     * {lambda} The lambda function to be executed
     */
    executeWithPackagerRunning(lambda) {
        // Start the packager before executing the React-Native command
        this.logger.info("Attempting to start the React Native packager");
        return this.runStartPackagerCommandAndUpdateStatus().then(lambda);
    }
    /**
     * Ensures that we are in a React Native project and then executes the operation
     * Otherwise, displays an error message banner
     * {operation} - a function that performs the expected operation
     */
    executeCommandInContext(rnCommand, operation) {
        let reactNativeProjectHelper = new reactNativeProjectHelper_1.ReactNativeProjectHelper(this.workspaceRoot);
        return telemetryHelper_1.TelemetryHelper.generate("RNCommand", (generator) => {
            generator.add("command", rnCommand, false);
            return reactNativeProjectHelper.isReactNativeProject().then(isRNProject => {
                generator.add("isRNProject", isRNProject, false);
                if (isRNProject) {
                    // Bring the log channel to focus
                    this.logger.setFocusOnLogChannel();
                    // Execute the operation
                    return operation();
                }
                else {
                    vscode.window.showErrorMessage("Current workspace is not a React Native project.");
                    return;
                }
            });
        });
    }
    /**
     * Publish project to exponent server. In order to do this we need to make sure the user is logged in exponent and the packager is running.
     */
    executePublishToExpHost() {
        this.logger.info("Publishing app to Exponent server. This might take a moment.");
        return this.loginToExponent()
            .then(user => {
            this.logger.debug(`Publishing as ${user.username}...`);
            return this.startExponentPackager()
                .then(() => XDL.publish(this.workspaceRoot))
                .then(response => {
                if (response.err || !response.url) {
                    return false;
                }
                const publishedOutput = `App successfully published to ${response.url}`;
                this.logger.info(publishedOutput);
                vscode.window.showInformationMessage(publishedOutput);
                return true;
            });
        }).catch(() => {
            this.logger.warning("An error has occured. Please make sure you are logged in to exponent, your project is setup correctly for publishing and your packager is running as exponent.");
            return false;
        });
    }
    loginToExponent() {
        return this.exponentHelper.loginToExponent((message, password) => {
            return Q.Promise((resolve, reject) => {
                vscode.window.showInputBox({ placeHolder: message, password: password })
                    .then(resolve, reject);
            });
        }, (message) => {
            return Q.Promise((resolve, reject) => {
                vscode.window.showInformationMessage(message)
                    .then(resolve, reject);
            });
        });
    }
}
exports.CommandPaletteHandler = CommandPaletteHandler;

//# sourceMappingURL=commandPaletteHandler.js.map
