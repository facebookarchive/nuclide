"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launcherProvider_1 = require("./launcherProvider");
const LocalDebugClient_1 = require("./LocalDebugClient");
const localDebugClientV2_1 = require("./localDebugClientV2");
const NonDebugClient_1 = require("./NonDebugClient");
const nonDebugClientV2_1 = require("./nonDebugClientV2");
const RemoteDebugClient_1 = require("./RemoteDebugClient");
function CreateLaunchDebugClient(launchRequestOptions, debugSession, canLaunchTerminal) {
    let launchScriptProvider;
    let debugClientClass;
    if (launchRequestOptions.noDebug === true) {
        launchScriptProvider = new launcherProvider_1.NoDebugLauncherScriptProvider();
        debugClientClass = launchRequestOptions.type === 'pythonExperimental' ? nonDebugClientV2_1.NonDebugClientV2 : NonDebugClient_1.NonDebugClient;
    }
    else {
        launchScriptProvider = new launcherProvider_1.DebuggerLauncherScriptProvider();
        debugClientClass = launchRequestOptions.type === 'pythonExperimental' ? localDebugClientV2_1.LocalDebugClientV2 : LocalDebugClient_1.LocalDebugClient;
    }
    return new debugClientClass(launchRequestOptions, debugSession, canLaunchTerminal, launchScriptProvider);
}
exports.CreateLaunchDebugClient = CreateLaunchDebugClient;
function CreateAttachDebugClient(attachRequestOptions, debugSession) {
    return new RemoteDebugClient_1.RemoteDebugClient(attachRequestOptions, debugSession);
}
exports.CreateAttachDebugClient = CreateAttachDebugClient;
//# sourceMappingURL=DebugFactory.js.map