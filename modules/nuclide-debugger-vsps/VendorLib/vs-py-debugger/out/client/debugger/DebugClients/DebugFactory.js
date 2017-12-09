"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocalDebugClient_1 = require("./LocalDebugClient");
const NonDebugClient_1 = require("./NonDebugClient");
const RemoteDebugClient_1 = require("./RemoteDebugClient");
function CreateLaunchDebugClient(launchRequestOptions, debugSession) {
    if (launchRequestOptions.noDebug === true) {
        return new NonDebugClient_1.NonDebugClient(launchRequestOptions, debugSession);
    }
    return new LocalDebugClient_1.LocalDebugClient(launchRequestOptions, debugSession);
}
exports.CreateLaunchDebugClient = CreateLaunchDebugClient;
function CreateAttachDebugClient(attachRequestOptions, debugSession) {
    return new RemoteDebugClient_1.RemoteDebugClient(attachRequestOptions, debugSession);
}
exports.CreateAttachDebugClient = CreateAttachDebugClient;
//# sourceMappingURL=DebugFactory.js.map