"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launcherProvider_1 = require("./launcherProvider");
const LocalDebugClient_1 = require("./LocalDebugClient");
const NonDebugClient_1 = require("./NonDebugClient");
const RemoteDebugClient_1 = require("./RemoteDebugClient");
function CreateLaunchDebugClient(launchRequestOptions, debugSession, canLaunchTerminal) {
    if (launchRequestOptions.noDebug === true) {
        return new NonDebugClient_1.NonDebugClient(launchRequestOptions, debugSession, canLaunchTerminal, new launcherProvider_1.NoDebugLauncherScriptProvider());
    }
    const launchScriptProvider = launchRequestOptions.type === 'pythonExperimental' ? new launcherProvider_1.DebuggerV2LauncherScriptProvider() : new launcherProvider_1.DebuggerLauncherScriptProvider();
    return new LocalDebugClient_1.LocalDebugClient(launchRequestOptions, debugSession, canLaunchTerminal, launchScriptProvider);
}
exports.CreateLaunchDebugClient = CreateLaunchDebugClient;
function CreateAttachDebugClient(attachRequestOptions, debugSession) {
    return new RemoteDebugClient_1.RemoteDebugClient(attachRequestOptions, debugSession);
}
exports.CreateAttachDebugClient = CreateAttachDebugClient;
//# sourceMappingURL=DebugFactory.js.map