'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseDebugServer_1 = require("./BaseDebugServer");
class NonDebugServer extends BaseDebugServer_1.BaseDebugServer {
    constructor(debugSession, pythonProcess) {
        super(debugSession, pythonProcess);
    }
    Stop() {
    }
    Start() {
        return Promise.resolve({ port: NaN, host: null });
    }
}
exports.NonDebugServer = NonDebugServer;
//# sourceMappingURL=NonDebugServer.js.map