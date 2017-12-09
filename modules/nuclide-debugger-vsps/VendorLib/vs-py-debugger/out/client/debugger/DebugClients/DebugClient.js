"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
var DebugType;
(function (DebugType) {
    DebugType[DebugType["Local"] = 0] = "Local";
    DebugType[DebugType["Remote"] = 1] = "Remote";
    DebugType[DebugType["RunLocal"] = 2] = "RunLocal";
})(DebugType = exports.DebugType || (exports.DebugType = {}));
class DebugClient extends events_1.EventEmitter {
    constructor(args, debugSession) {
        super();
        this.debugSession = debugSession;
    }
    get DebugType() {
        return DebugType.Local;
    }
    Stop() {
    }
    LaunchApplicationToDebug(dbgServer, processErrored) {
        return Promise.resolve();
    }
}
exports.DebugClient = DebugClient;
//# sourceMappingURL=DebugClient.js.map