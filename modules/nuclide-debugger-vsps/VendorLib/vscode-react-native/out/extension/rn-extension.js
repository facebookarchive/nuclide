"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const Q = require("q");
const path = require("path");
const vscode = require("vscode");
const fileSystem_1 = require("../common/node/fileSystem");
const commandPaletteHandler_1 = require("./commandPaletteHandler");
const packager_1 = require("../common/packager");
const entryPointHandler_1 = require("../common/entryPointHandler");
const errorHelper_1 = require("../common/error/errorHelper");
const internalErrorCode_1 = require("../common/error/internalErrorCode");
const settingsHelper_1 = require("./settingsHelper");
const packagerStatusIndicator_1 = require("./packagerStatusIndicator");
const reactNativeProjectHelper_1 = require("../common/reactNativeProjectHelper");
const reactDirManager_1 = require("./reactDirManager");
const intellisenseHelper_1 = require("./intellisenseHelper");
const telemetry_1 = require("../common/telemetry");
const telemetryHelper_1 = require("../common/telemetryHelper");
const extensionServer_1 = require("./extensionServer");
const OutputChannelLogger_1 = require("./log/OutputChannelLogger");
const exponentHelper_1 = require("./exponent/exponentHelper");
const qrCodeContentProvider_1 = require("./qrCodeContentProvider");
const configurationReader_1 = require("../common/configurationReader");
/* all components use the same packager instance */
const projectRootPath = settingsHelper_1.SettingsHelper.getReactNativeProjectRoot();
const workspaceRootPath = vscode.workspace.rootPath;
const packagerPort = configurationReader_1.ConfigurationReader.readIntWithDefaultSync(settingsHelper_1.SettingsHelper.getPackagerPort(), packager_1.Packager.DEFAULT_PORT);
const globalPackager = new packager_1.Packager(workspaceRootPath, projectRootPath, packagerPort);
const packagerStatusIndicator = new packagerStatusIndicator_1.PackagerStatusIndicator();
const globalExponentHelper = new exponentHelper_1.ExponentHelper(workspaceRootPath, projectRootPath);
const commandPaletteHandler = new commandPaletteHandler_1.CommandPaletteHandler(projectRootPath, globalPackager, packagerStatusIndicator, globalExponentHelper);
const outputChannelLogger = OutputChannelLogger_1.OutputChannelLogger.getMainChannel();
const entryPointHandler = new entryPointHandler_1.EntryPointHandler(entryPointHandler_1.ProcessType.Extension, outputChannelLogger);
const reactNativeProjectHelper = new reactNativeProjectHelper_1.ReactNativeProjectHelper(projectRootPath);
const fsUtil = new fileSystem_1.FileSystem();
function activate(context) {
    entryPointHandler.runApp("react-native", () => require("../../package.json").version, errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.ExtensionActivationFailed), projectRootPath, () => {
        return reactNativeProjectHelper.isReactNativeProject()
            .then(isRNProject => {
            if (isRNProject) {
                let activateExtensionEvent = telemetryHelper_1.TelemetryHelper.createTelemetryEvent("activate");
                telemetry_1.Telemetry.send(activateExtensionEvent);
                warnWhenReactNativeVersionIsNotSupported();
                entryPointHandler.runFunction("debugger.setupLauncherStub", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.DebuggerStubLauncherFailed), () => setupAndDispose(new reactDirManager_1.ReactDirManager(), context)
                    .then(() => setupAndDispose(new extensionServer_1.ExtensionServer(projectRootPath, globalPackager, packagerStatusIndicator), context))
                    .then(() => { }));
                entryPointHandler.runFunction("intelliSense.setup", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.IntellisenseSetupFailed), () => intellisenseHelper_1.IntellisenseHelper.setupReactNativeIntellisense());
            }
            entryPointHandler.runFunction("debugger.setupNodeDebuggerLocation", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.NodeDebuggerConfigurationFailed), () => {
                configureNodeDebuggerLocation();
            });
            registerReactNativeCommands(context);
            context.subscriptions.push(vscode.workspace
                .registerTextDocumentContentProvider("exp", new qrCodeContentProvider_1.QRCodeContentProvider()));
        });
    });
}
exports.activate = activate;
function deactivate() {
    return Q.Promise(function (resolve) {
        // Kill any packager processes that we spawned
        entryPointHandler.runFunction("extension.deactivate", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToStopPackagerOnExit), () => {
            commandPaletteHandler.stopPackager().done(() => {
                // Tell vscode that we are done with deactivation
                resolve(void 0);
            });
        }, /*errorsAreFatal*/ true);
    });
}
exports.deactivate = deactivate;
function configureNodeDebuggerLocation() {
    const nodeDebugExtension = vscode.extensions.getExtension("ms-vscode.node-debug2");
    if (!nodeDebugExtension) {
        return Q.reject(errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.CouldNotFindLocationOfNodeDebugger));
    }
    const nodeDebugPath = nodeDebugExtension.extensionPath;
    return fsUtil.writeFile(path.resolve(__dirname, "../", "debugger", "nodeDebugLocation.json"), JSON.stringify({ nodeDebugPath }));
}
function setupAndDispose(setuptableDisposable, context) {
    return setuptableDisposable.setup()
        .then(() => {
        context.subscriptions.push(setuptableDisposable);
        return setuptableDisposable;
    });
}
function warnWhenReactNativeVersionIsNotSupported() {
    return reactNativeProjectHelper.validateReactNativeVersion().done(() => { }, reason => {
        telemetryHelper_1.TelemetryHelper.sendSimpleEvent("unsupportedRNVersion", { rnVersion: reason });
        const shortMessage = `React Native Tools need React Native version 0.19.0 or later to be installed in <PROJECT_ROOT>/node_modules/`;
        const longMessage = `${shortMessage}: ${reason}`;
        vscode.window.showWarningMessage(shortMessage);
        outputChannelLogger.warning(longMessage);
    });
}
function registerReactNativeCommands(context) {
    // Register React Native commands
    registerVSCodeCommand(context, "runAndroidSimulator", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToRunOnAndroid), () => commandPaletteHandler.runAndroid("simulator"));
    registerVSCodeCommand(context, "runAndroidDevice", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToRunOnAndroid), () => commandPaletteHandler.runAndroid("device"));
    registerVSCodeCommand(context, "runIosSimulator", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToRunOnIos), () => commandPaletteHandler.runIos("simulator"));
    registerVSCodeCommand(context, "runIosDevice", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToRunOnIos), () => commandPaletteHandler.runIos("device"));
    registerVSCodeCommand(context, "startPackager", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToStartPackager), () => commandPaletteHandler.startPackager());
    registerVSCodeCommand(context, "startExponentPackager", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToStartExponentPackager), () => commandPaletteHandler.startExponentPackager());
    registerVSCodeCommand(context, "stopPackager", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToStopPackager), () => commandPaletteHandler.stopPackager());
    registerVSCodeCommand(context, "restartPackager", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToRestartPackager), () => commandPaletteHandler.restartPackager());
    registerVSCodeCommand(context, "publishToExpHost", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.FailedToPublishToExpHost), () => commandPaletteHandler.publishToExpHost());
    registerVSCodeCommand(context, "showDevMenu", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.CommandFailed), () => commandPaletteHandler.showDevMenu());
    registerVSCodeCommand(context, "reloadApp", errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.CommandFailed), () => commandPaletteHandler.reloadApp());
}
function registerVSCodeCommand(context, commandName, error, commandHandler) {
    context.subscriptions.push(vscode.commands.registerCommand(`reactNative.${commandName}`, () => entryPointHandler.runFunction(`commandPalette.${commandName}`, error, commandHandler)));
}

//# sourceMappingURL=rn-extension.js.map
