"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocalDebugServer_1 = require("./LocalDebugServer");
function CreateDebugServer(debugSession, pythonProcess, args) {
    return new LocalDebugServer_1.LocalDebugServer(debugSession, pythonProcess, args);
}
exports.CreateDebugServer = CreateDebugServer;
//# sourceMappingURL=DebugServerFactory.js.map