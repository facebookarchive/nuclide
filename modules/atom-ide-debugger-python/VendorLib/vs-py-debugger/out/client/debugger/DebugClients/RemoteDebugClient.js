"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RemoteDebugServer_1 = require("../DebugServers/RemoteDebugServer");
const DebugClient_1 = require("./DebugClient");
class RemoteDebugClient extends DebugClient_1.DebugClient {
    // tslint:disable-next-line:no-any
    constructor(args, debugSession) {
        super(args, debugSession);
    }
    CreateDebugServer(pythonProcess) {
        this.pythonProcess = pythonProcess;
        this.debugServer = new RemoteDebugServer_1.RemoteDebugServer(this.debugSession, this.pythonProcess, this.args);
        return this.debugServer;
    }
    get DebugType() {
        return DebugClient_1.DebugType.Remote;
    }
    Stop() {
        if (this.pythonProcess) {
            this.pythonProcess.Detach();
        }
        if (this.debugServer) {
            this.debugServer.Stop();
            this.debugServer = undefined;
        }
    }
}
exports.RemoteDebugClient = RemoteDebugClient;
//# sourceMappingURL=RemoteDebugClient.js.map